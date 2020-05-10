import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# removeMember", () => {
  describe("One node", () => {
    let member: MemberModel;
    let shadowMember: MemberModel;

    let group: GroupModel;
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
      await group.removeMember(member._id.toString());
    });

    it("should remove the group member from the group", async () => {
      const groupDB = await Group.findById(group._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(1);
      expect(groupDB?.members[0].toString()).to.be.equal(
        shadowMember._id.toString()
      );
    });

    it("the member should be removed from the database.", async () => {
      const memberDB = await Member.findById(member._id).exec();
      expect(memberDB).to.not.exist;
    });

    it("should not throw when removing a shadow member", async () => {
      await group.removeMember(shadowMember._id.toString());
    });

    it("should remove the shadow member from the group.", async () => {
      const groupDB = await Group.findById(group._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(0);
    });

    it("the shadow member should be removed from the database.", async () => {
      const memberDB = await Member.findById(shadowMember._id).exec();
      expect(memberDB).to.not.exist;
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Tree with roots with non-shadow member", () => {
    let member: MemberModel;
    let root: GroupModel;
    let group: GroupModel;
    let subgroup: GroupModel;

    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });

      await root.addMember(user);

      group = await root.addGroup({
        name: "Middle Group",
        description: "Sample Middle",
        createdBy: user._id.toString(),
      });

      await group.addMember(user);

      subgroup = await group.addGroup({
        name: "Leaf Group",
        description: "Sample Leaf",
        createdBy: user._id.toString(),
      });
      member = await subgroup.addMember(user);
    });

    it("should not throw when removing a non-shadow member", async () => {
      await group.removeMember(member._id.toString());
    });

    it("should remove the group member from the middle node", async () => {
      const groupDB = await Group.findById(subgroup._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(0);
    });
    it("should remove the group member from the leaf node", async () => {
      const groupDB = await Group.findById(subgroup._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(0);
    });

    it("should remove the group from the member object", async () => {
      const memberDB = await Member.findById(member._id).exec();
      expect(memberDB?.groups.length).to.be.equal(1);
      expect(memberDB?.groups[0].group.toString()).to.be.equal(
        root._id.toString()
      );
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("Tree with roots with shadow member", () => {
    let member: MemberModel;
    let root: GroupModel;
    let group: GroupModel;
    let subgroup: GroupModel;

    before(async () => {
      const user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });

      await root.addMember();

      group = await root.addGroup({
        name: "Middle Group",
        description: "Sample Middle",
        createdBy: user._id.toString(),
      });

      member = await group.addMember();

      subgroup = await group.addGroup({
        name: "Leaf Group",
        description: "Sample Leaf",
        createdBy: user._id.toString(),
      });
      await subgroup.addMember();
    });

    it("should not throw when removing a shadow member", async () => {
      await group.removeMember(member._id.toString());
    });

    it("should not remove the group member from the middle node", async () => {
      const groupDB = await Group.findById(subgroup._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(1);
    });
    it("should not remove the group member from the leaf node", async () => {
      const groupDB = await Group.findById(subgroup._id).exec();
      expect(groupDB).to.exist;
      expect(groupDB?.members.length).to.be.equal(1);
    });

    it("should remove the member object from the database", async () => {
      const memberDB = await Member.findById(member._id).exec();
      expect(memberDB).to.not.exist;
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
});
