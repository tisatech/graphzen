import { expect } from "chai";
import { Group, GroupModel } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member } from "../../../../../src/model/members";

describe("# deleteGroup", () => {
  describe("Single group", () => {
    let _id: string;
    before(async () => {
      const testPayload: any = {
        name: "Sample Group",
        description: "Group description.",
      };
      const user = await User.createUser({
        name: "Sample name",
        email: "sample@sample.com",
        password: "sample-password",
      });
      testPayload.createdBy = user._id.toString();
      const group = await Group.createGroup(testPayload);
      _id = group._id.toString();
    });

    it("should throw no error.", async () => {
      await Group.deleteGroup(_id);
    });
    it("should delete the group from the database.", async () => {
      const group = await Group.findById(_id).exec();
      expect(group).to.not.exist;
    });

    after(async () => {
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });

  describe("Group with tree height of 4 remove non-root node.", () => {
    const members: string[] = [];
    const groups: string[] = [];
    let _id: string = "";
    let memberID: string = "";
    let rootID: string = "";

    before(async () => {
      const memberModels: MemberModel[] = [];
      // creator user.
      const user = await User.create({
        name: "Sample",
        email: "sample@sample.com",
        password: "samplepassword",
      });

      // create root group.
      const root = await user.createGroup({
        name: "root group",
        description: "root group",
      });
      rootID = root._id.toString();
      const rootMember = await root.addMember(user);
      memberModels.push(rootMember);
      memberID = rootMember._id.toString();

      // To be removed.
      const toRemove = await root.addGroup({
        name: "Group to be removed",
        description: "This group will be removed.",
        createdBy: user._id.toString(),
      });
      memberModels.push(await toRemove.addMember(user));

      const levelOneGroup: GroupModel[] = [];
      for (let i = 0; i < 3; i++) {
        const group = await toRemove.addGroup({
          name: `Group ${i}`,
          description: "Level one Group",
          createdBy: user._id.toString(),
        });
        //add member
        memberModels.push(await group.addMember(user));
        levelOneGroup.push(group);
      }

      const levelTwoGroup: GroupModel[] = [];
      for (let i = 0; i < 3; i++) {
        const group = await levelOneGroup[i].addGroup({
          name: `Group leaf ${i}`,
          description: "Level two group",
          createdBy: user._id.toString(),
        });

        // add user and shadow
        memberModels.push(await group.addMember(user), await group.addMember());
        levelTwoGroup.push(group);
      }
      members.push(...memberModels.map((x) => x._id.toString()));
      [root, toRemove, ...levelOneGroup, ...levelTwoGroup].forEach((x) => {
        groups.push(x._id.toString());
      });

      _id = toRemove._id.toString();
    });

    it("should throw no error.", async () => {
      await Group.deleteGroup(_id);
    });
    it("should delete the group from the database.", async () => {
      const group = await Group.findById(_id).exec();
      expect(group).to.not.exist;
    });
    it("should disconnect members from the group.", async () => {
      const members = await Member.find({});
      expect(members.length).to.be.equal(1);
      const member = members[0];
      expect(member._id.toString()).to.be.equal(memberID);
      expect(member.groups.length).to.be.equal(1);
      expect(member.groups[0].group.toString()).to.be.equal(_id);
    });
    it("should delete all subgroups.", async () => {
      const groups = await Group.find({});
      expect(groups.length).to.be.equal(1);
      const group = groups[0];
      expect(group._id.toString()).to.be.equal(rootID);
    });

    after(async () => {
      await Member.deleteMany({});
      await Group.deleteMany({});
      await User.deleteMany({});
    });
  });
});
