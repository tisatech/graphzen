import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { Member } from "../../../../../src/model/members";

describe("# removeGroup", () => {
  let group: GroupModel;
  let child: GroupModel;
  let user: UserModel;
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

    child = await group.addGroup({
      name: "Child Group",
      description: "Child Group Description",
      createdBy: user._id.toString(),
    });

    child.addMember();
  });

  it("should not throw", async () => {
    await group.removeGroup(child._id.toString());
  });

  it("should update subgroups of parent group", async () => {
    const groupDB = await Group.getGroup(group._id.toString());
    expect(groupDB.subgroups.length).to.be.equal(0);
  });

  it("should not exist in the database", async () => {
    const groupDB = await Group.findById(child._id.toString());
    expect(groupDB).to.not.exist;
  });

  it("should remove members", async () => {
    const member = await Member.findOne({});
    expect(member).to.not.exist;
  });

  after(async () => {
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
