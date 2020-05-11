import { expect } from "chai";
import { Member, MemberModel } from "../../../../../src/model/members";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";

describe("# assignUser", () => {
  let group: GroupModel;
  let member: MemberModel;
  let nonShadowMember: MemberModel;
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
    nonShadowMember = await group.addMember(user);
    member = await group.addMember();
  });

  it("should throw when assigning to non-shadow member.", async () => {
    await expect(
      (async () => {
        await nonShadowMember.assignUser(user._id.toString());
      })()
    ).to.eventually.rejected;
  });
  it("should not throw.", async () => {
    await member.assignUser(user._id.toString());
  });

  it("should update the member document", async () => {
    const memberDB = await Member.findById(member._id.toString()).exec();
    expect(memberDB).to.exist;
    expect(memberDB?.user).to.exist;
    expect(memberDB?.user?.toString()).to.be.equal(user._id.toString());
    expect(memberDB?.isShadow).to.be.false;
    expect(memberDB?.isPublished).to.be.false;
  });
  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await Member.deleteMany({});
  });
});
