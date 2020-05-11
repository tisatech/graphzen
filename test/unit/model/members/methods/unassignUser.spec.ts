import { expect } from "chai";
import { Member, MemberModel } from "../../../../../src/model/members";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";

describe("# unassignUser", () => {
  let group: GroupModel;
  let member: MemberModel;
  let shadowMember: MemberModel;
  let user: UserModel;
  before(async () => {
    user = await User.createUser({
      name: "sample",
      email: "email@email.com",
      password: "password",
    });
    group = await user.createGroup({
      name: "sample group",
      description: "sample group",
    });
    member = await group.addMember(user);
    shadowMember = await group.addMember();
  });

  it("should throw when unassigning shadow member.", async () => {
    await expect(
      (async () => {
        await shadowMember.unassignUser();
      })()
    ).to.eventually.rejected;
  });
  it("should not throw.", async () => {
    await member.unassignUser();
  });

  it("should update the member document", async () => {
    const memberDB = await Member.findById(member._id.toString()).exec();
    expect(memberDB).to.exist;
    expect(memberDB?.user).to.not.exist;
    expect(memberDB?.isShadow).to.be.true;
    expect(memberDB?.isPublished).to.be.false;
  });
  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await Member.deleteMany({});
  });
});
