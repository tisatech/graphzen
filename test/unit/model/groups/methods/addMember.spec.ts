import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# addMember", () => {
  describe("Root group, shadow account", () => {
    let group: GroupModel;
    before(async () => {
      const user = await User.createUser({
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
    let member: MemberModel;
    it("should not throw", async () => {
      member = await group.addMember();
    });

    it("should have proper values.", () => {
      expect(member.user).to.not.exist;
      expect(member.isShadow).to.be.true;
      expect(member.isPublished).to.be.false;
      expect(member.scope_group.toString()).to.be.equal(group._id.toString());
      expect(member.groups.length).to.be.equal(1);

      const groupItem = member.groups[0];
      expect(groupItem.group.toString()).to.be.equal(group._id.toString());
      expect(groupItem.nickname).to.be.equal("New Member");
      expect(groupItem.customID).to.be.equal("No ID");
    });

    it("should update the group `members` property", () => {
      expect(group.members.length).to.be.equal(1);
      expect(group.members[0].toString()).to.be.equal(member._id.toString());
    });

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Root group, non-shadow account", () => {
    let group: GroupModel;
    let newUser: UserModel;
    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      newUser = await User.createUser({
        name: "New User",
        email: "email@email.com",
        password: "password",
      });

      group = await Group.createGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });
    });
    let member: MemberModel;
    it("should not throw", async () => {
      member = await group.addMember(newUser);
    });

    it("should have proper values.", () => {
      expect(member.user?.toString()).to.be.equal(newUser._id.toString());
      expect(member.isShadow).to.be.false;
      expect(member.isPublished).to.be.false;
      expect(member.scope_group.toString()).to.be.equal(group._id.toString());
      expect(member.groups.length).to.be.equal(1);

      const groupItem = member.groups[0];
      expect(groupItem.group.toString()).to.be.equal(group._id.toString());
      expect(groupItem.nickname).to.be.equal("New User");
      expect(groupItem.customID).to.be.equal("No ID");
    });

    it("should update the group `members` property", () => {
      expect(group.members.length).to.be.equal(1);
      expect(group.members[0].toString()).to.be.equal(member._id.toString());
    });
    it("should throw when adding duplicate user.");

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Non-root group, shadow account", () => {
    let root: GroupModel;
    let group: GroupModel;
    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Root Group",
        description: "Root group",
        createdBy: user._id.toString(),
      });
      group = await root.addGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });
    });
    let member: MemberModel;
    it("should not throw", async () => {
      member = await group.addMember();
    });

    it("should have proper values.", () => {
      expect(member.user).to.not.exist;
      expect(member.isShadow).to.be.true;
      expect(member.isPublished).to.be.false;
      expect(member.scope_group.toString()).to.be.equal(group._id.toString());
      expect(member.groups.length).to.be.equal(1);

      const groupItem = member.groups[0];
      expect(groupItem.group.toString()).to.be.equal(group._id.toString());
      expect(groupItem.nickname).to.be.equal("New Member");
      expect(groupItem.customID).to.be.equal("No ID");
    });

    it("should update the group `members` property", () => {
      expect(group.members.length).to.be.equal(1);
      expect(group.members[0].toString()).to.be.equal(member._id.toString());
    });

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Non-Root group, non-shadow account with user in root.", () => {
    let group: GroupModel;
    let newUser: UserModel;
    let root: GroupModel;
    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      newUser = await User.createUser({
        name: "New User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Root Group",
        description: "Root group",
        createdBy: user._id.toString(),
      });
      group = await root.addGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });
      await root.addMember(newUser);
    });
    let member: MemberModel;
    it("should not throw", async () => {
      member = await group.addMember(newUser);
    });
    it("should throw when adding duplicate user.");

    it("should have proper values.", () => {
      expect(member.user?.toString()).to.be.equal(newUser._id.toString());
      expect(member.isShadow).to.be.false;
      expect(member.isPublished).to.be.false;
      expect(member.scope_group.toString()).to.be.equal(root._id.toString());
      expect(member.groups.length).to.be.equal(2);

      const groupItem = member.groups[0];
      expect(groupItem.group.toString()).to.be.equal(root._id.toString());
      expect(groupItem.nickname).to.be.equal("New User");
      expect(groupItem.customID).to.be.equal("No ID");

      const groupItem2 = member.groups[1];
      expect(groupItem2.group.toString()).to.be.equal(group._id.toString());
      expect(groupItem2.nickname).to.be.equal("New User");
      expect(groupItem2.customID).to.be.equal("No ID");
    });

    it("should update the group `members` property", () => {
      expect(group.members.length).to.be.equal(1);
      expect(group.members[0].toString()).to.be.equal(member._id.toString());
    });

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Non-Root group, non-shadow account with user not in root.", () => {
    let group: GroupModel;
    let newUser: UserModel;
    let root: GroupModel;
    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      newUser = await User.createUser({
        name: "New User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Root Group",
        description: "Root group",
        createdBy: user._id.toString(),
      });
      group = await root.addGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });
    });
    let member: MemberModel;
    it("should throw", async () => {
      await expect(
        (async () => {
          member = await group.addMember(newUser);
        })()
      ).to.eventually.rejected;
    });
    it("should throw when adding duplicate user.");

    it("should not update the group `members` property", () => {
      expect(group.members.length).to.be.equal(0);
    });

    afterEach(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
});
