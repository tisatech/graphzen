import { expect } from "chai";
import { Member, MemberModel } from "../../../../../src/model/members";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";

describe("# unpublish", () => {
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

  it("should throw when unpublishing non-shadow member.", async () => {
    await expect(
      (async () => {
        await nonShadowMember.unpublish();
      })()
    ).to.eventually.rejected;
  });
  it("should not throw.", async () => {
    await member.unpublish();
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
