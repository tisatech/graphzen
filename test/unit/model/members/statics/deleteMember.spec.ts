import { expect } from "chai";
import { Group, GroupModel } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# deleteMember", () => {
  let _id: string;
  let group: GroupModel;
  let subGroup: GroupModel;
  let member: MemberModel;
  before(async () => {
    const user = await User.createUser({
      name: "sample",
      email: "email@email.com",
      password: "password",
    });
    group = await user.createGroup({
      name: "sample group",
      description: "sample group",
    });
    member = await group.addMember(user);
    subGroup = await group.addGroup({
      name: "sample group",
      description: "sample group",
      createdBy: user._id.toString(),
    });
    await subGroup.addMember(user);

    _id = member._id.toString();
  });

  it("should throw no error when deleting subgroup.", async () => {
    await Member.deleteMember(_id, subGroup._id.toString());
  });

  it("should properly update the member document.", async () => {
    const memberDB = await Member.findById(_id).exec();
    expect(memberDB).to.exist;
    expect(memberDB?.groups.length).to.be.equal(1);
    expect(memberDB?.groups.length).to.be.equal(1);
    expect(memberDB?.groups[0].group.toString()).to.be.equal(
      group._id.toString()
    );
  });
  it("should throw error when deleting group.", async () => {
    await Member.deleteMember(_id, group._id.toString());
  });

  it("should remove member from the database.", async () => {
    const memberDB = await Member.findById(_id).exec();
    expect(memberDB).to.not.exist;
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await Member.deleteMany({});
  });
});
