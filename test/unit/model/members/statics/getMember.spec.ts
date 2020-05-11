import { expect } from "chai";
import { Group, GroupModel } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# getMember", () => {
  let group: GroupModel;
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
    // create dummy members
    await group.addMember();
    await group.addMember();
    await group.addMember();
  });

  it("should return the correct member", async () => {
    const memberDB = await Member.getMember(member._id.toString());
    expect(memberDB.toObject()).to.be.eql(member.toObject());
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
