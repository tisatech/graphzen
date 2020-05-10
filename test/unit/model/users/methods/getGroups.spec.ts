import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";
import { Member } from "../../../../../src/model/members";
import { GroupModel, Group } from "../../../../../src/model/groups";

describe("# getGroups", () => {
  let user: UserModel;
  let group: GroupModel;

  before(async () => {
    user = await User.createUser({
      name: "sample name",
      email: "sample email",
      password: "sample password",
    });

    group = await user.createGroup({
      name: "sample group name",
      description: "sample description",
    });

    // member that is correct
    const member = new Member();
    member.scope_group = group._id.toString();
    member.isShadow = false;
    member.isPublished = false;
    member.user = user._id.toString();
    member.groups = [
      {
        group: group._id.toString(),
        nickname: "sample nickname",
        customID: "sample ID",
      },
    ];
    await member.save();

    // group that is not correct
    const uselessGroup = new Group();
    uselessGroup.name = "Sample group.";
    uselessGroup.description = "Sample description";
    await uselessGroup.save();
  });

  it("should get the correct groups", async () => {
    const groups = await user.getGroups();
    expect(groups.length).to.be.equal(1);
    expect(groups[0]).to.be.eql(group._id.toString());
  });

  after(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
