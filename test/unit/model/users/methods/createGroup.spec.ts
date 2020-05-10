import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";
import { GroupModel, Group } from "../../../../../src/model/groups";

describe("# createGroup", () => {
  let user: UserModel;
  let group: GroupModel;
  let groupFromDB: GroupModel;
  const testPayload = {
    name: "Sample Group",
    description: "Sample Description",
  };

  before(async () => {
    user = await User.createUser({
      name: "sample",
      email: "sample",
      password: "sample",
    });
  });
  it("should not throw any error.", async () => {
    group = await user.createGroup(testPayload);
  });
  it("should create a new group", async () => {
    const group = await Group.findOne({});
    expect(group).to.exist;
    groupFromDB = group as GroupModel;
  });
  it("should return the created group", () => {
    expect(group.toObject()).to.be.eql(groupFromDB.toObject());
  });
  it("should contain the correct group details", () => {
    expect(group.createdBy.toString()).to.be.equal(user._id.toString());
    expect(group.parentGroup).to.not.exist;
    expect(group.isRoot).to.be.true;
  });
  it("should update `owned_group` in the user", () => {
    expect(user.owned_groups.length).to.be.equal(1);
    expect(user.owned_groups[0].toString()).to.be.equal(group._id.toString());
  });

  after(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });
});
