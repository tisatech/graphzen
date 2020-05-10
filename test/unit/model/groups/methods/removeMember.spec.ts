import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# removeMember", () => {
  describe("One node", () => {
    let member: MemberModel;
    let shadowMember: MemberModel;

    let group: GroupModel;
    let groupsRemoved: string[] = [];
    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });
      const newUser = await User.createUser({
        name: "New Sample User",
        email: "email@email.com",
        password: "password",
      });
      group = await Group.createGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });

      member = await group.addMember(newUser);
      shadowMember = await group.addMember();
    });

    it("should not throw when removing a non-shadow member", async () => {
      groupsRemoved = await group.removeMember(member._id.toString());
    });

    it("should process the right groups.", () => {
      expect(groupsRemoved.length).to.be.equal(1);
      expect(groupsRemoved[0]).to.be.equal(group._id.toString());
    });

    it("should remove the group member", () => {
      expect(group.members.length).to.be.equal(1);
      expect(group.members[0].toString()).to.be.equal(
        shadowMember._id.toString()
      );
    });

    it("should not throw when removing a shadow member", async () => {
      groupsRemoved = await group.removeMember(shadowMember._id.toString());
    });

    it("should remove the shadow member from the group.", () => {
      expect(group.members.length).to.be.equal(0);
    });

    it("should process the right groups", () => {
      expect(groupsRemoved.length).to.be.equal(1);
      expect(groupsRemoved[0]).to.be.equal(group._id.toString());
    });

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Tree with roots", () => {
    let member: MemberModel;
    let group: GroupModel;

    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      const root = await Group.createGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });

      await root.addMember(user);

      group = await root.addGroup({
        name: "Leaf Group",
        description: "Sample leaf",
        createdBy: user._id.toString(),
      });

      member = await group.addMember(user);
    });

    it("", () => {});

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
});
