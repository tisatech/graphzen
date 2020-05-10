import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User, UserModel } from "../../../../../src/model/users";
import { Member, MemberModel } from "../../../../../src/model/members";

describe("# forkAsSibling", () => {
  describe(" In a root group.", () => {
    let group: GroupModel;
    let user: UserModel;
    let member: MemberModel;
    before(async () => {
      user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      group = await user.createGroup({
        name: "Sample Group",
        description: "Sample group",
      });

      member = await group.addMember(user);
    });

    let sibling: GroupModel;
    it("should not throw", async () => {
      sibling = await group.forkAsSibling(user._id.toString());
    });

    it("should update owned_groups of user", async () => {
      const userDB = await User.getUser(user._id.toString());
      expect(userDB.owned_groups.length).to.be.equal(2);
      expect(userDB.owned_groups[0].toString()).to.be.equal(
        group._id.toString()
      );
      expect(userDB.owned_groups[1].toString()).to.be.equal(
        sibling._id.toString()
      );
    });
    it("should have the right details", () => {
      expect(sibling.name).to.be.equal("Sample Group - Copy");
      expect(sibling.description).to.be.equal("Sample group");
      expect(sibling.createdBy.toString()).to.be.equal(user._id.toString());
      expect(sibling.parentGroup).to.not.exist;
      expect(sibling.isRoot).to.be.true;
    });
    it("should copy the members", () => {
      expect(sibling.members).to.be.eql(group.members);
    });
    it("should update the members groups", async () => {
      const memberDB = await Member.findById(member._id.toString());
      expect(memberDB?.groups.map((x) => x.group.toString())).to.be.eql([
        group._id.toString(),
        sibling._id.toString(),
      ]);
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
  describe("In the middle of the tree.", () => {
    let group: GroupModel;
    let root: GroupModel;
    let user: UserModel;
    let member: MemberModel;
    before(async () => {
      user = await User.createUser({
        name: "Sample User",
        email: "email@email.com",
        password: "password",
      });

      root = await Group.createGroup({
        name: "Sample root",
        description: "Sample root",
        createdBy: user._id.toString(),
      });

      group = await root.addGroup({
        name: "Sample Group",
        description: "Sample group",
        createdBy: user._id.toString(),
      });

      member = await group.addMember(user);
    });

    let sibling: GroupModel;
    it("should not throw", async () => {
      sibling = await group.forkAsSibling(user._id.toString());
    });

    it("should update subgroups of parent group", async () => {
      const groupDB = await Group.getGroup(root._id.toString());
      expect(groupDB.subgroups.length).to.be.equal(2);
      expect(groupDB.subgroups[0].toString()).to.be.equal(group._id.toString());
      expect(groupDB.subgroups[1].toString()).to.be.equal(
        sibling._id.toString()
      );
    });
    it("should have the right details", () => {
      expect(sibling.name).to.be.equal("Sample Group - Copy");
      expect(sibling.description).to.be.equal("Sample group");
      expect(sibling.createdBy.toString()).to.be.equal(user._id.toString());
      expect(sibling.parentGroup.toString()).to.be.equal(root._id.toString());
      expect(sibling.isRoot).to.be.false;
    });
    it("should copy the members", () => {
      expect(sibling.members).to.be.eql(group.members);
    });
    it("should update the members groups", async () => {
      const memberDB = await Member.findById(member._id.toString());
      expect(memberDB?.groups.map((x) => x.group.toString())).to.be.eql([
        group._id.toString(),
        sibling._id.toString(),
      ]);
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
});
