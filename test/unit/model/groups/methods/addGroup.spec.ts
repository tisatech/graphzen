import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { Member } from "../../../../../src/model/members";

describe("# addGroup", () => {
  let group: GroupModel;
  let user: UserModel;
  const payload = {
    name: "Child Group",
    description: "Child Group Description",
  };
  before(async () => {
    user = await User.createUser({
      name: "Sample User",
      email: "email@email.com",
      password: "password",
    });

    group = await Group.createGroup({
      name: "Sample Group",
      description: "Sample group",
      createdBy: user._id.toString(),
    });
  });

  let childGroup: GroupModel;
  it("should not throw", async () => {
    childGroup = await group.addGroup({
      createdBy: user._id.toString(),
      ...payload,
    });
  });

  it("should update subgroups of parent group", async () => {
    const groupDB = await Group.getGroup(group._id.toString());
    expect(groupDB.subgroups.length).to.be.equal(1);
    expect(groupDB.subgroups[0].toString()).to.be.equal(
      childGroup._id.toString()
    );
  });
  it("should have the right details", () => {
    expect(childGroup.name).to.be.equal(payload.name);
    expect(childGroup.description).to.be.equal(payload.description);
    expect(childGroup.createdBy.toString()).to.be.equal(user._id.toString());
    expect(childGroup.parentGroup.toString()).to.be.equal(group._id.toString());
    expect(childGroup.isRoot).to.be.false;
  });

  after(async () => {
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
