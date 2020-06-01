import { expect } from "chai";
import { User } from "../../../../../src/model/users";
import { Group, Member } from "../../../../../src";
import { ClearanceModel, Clearance } from "../../../../../src/model/clearances";
import {
  Requirement,
  Item,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
  MemberModel,
  GroupModel,
} from "../../../../../src/model";

describe("# getAllMembers", () => {
  let clearance: ClearanceModel;
  let group: GroupModel;

  const rawMembers: MemberModel[] = [];
  const groupMembers: MemberModel[] = [];

  before(async () => {
    const user = await User.createUser({
      name: "Sample name",
      email: "sample@sample.com",
      password: "sample-password",
    });
    group = await user.createGroup({
      name: "Sample Group",
      description: "Sample Group",
    });

    groupMembers.push(await group.addMember());
    groupMembers.push(await group.addMember());
    groupMembers.push(await group.addMember());

    clearance = await group.addClearance({
      name: `Sample Clearance`,
      description: `Sample Clearance`,
      createdBy: user._id.toString(),
    });

    rawMembers.push(
      await Member.createMember({
        scope_group: group._id.toString(),
        nickname: "Sample 1",
        customID: "Sample",
      })
    );
    rawMembers.push(
      await Member.createMember({
        scope_group: group._id.toString(),
        nickname: "Sample 2",
        customID: "Sample",
      })
    );
    rawMembers.push(
      await Member.createMember({
        scope_group: group._id.toString(),
        nickname: "Sample 3",
        customID: "Sample",
      })
    );

    await clearance.assignMember(rawMembers[0]);
    await clearance.assignMember(rawMembers[1]);
    await clearance.assignMember(rawMembers[2]);

    // the duplicate member
    await clearance.assignMember(groupMembers[0]);
    await clearance.assignGroup(group._id.toString());
  });

  let members: string[];
  it("should not throw", async () => {
    members = await clearance.getAllMembers();
  });

  it("should return the union of the members.", async () => {
    const union = [...rawMembers, ...groupMembers].map((x) => x._id.toString());
    expect(members).to.have.members(union);
  });

  after(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
    await Clearance.deleteMany({});
    await Requirement.deleteMany({});
    await Item.deleteMany({});
    await ClearanceProgress.deleteMany({});
    await RequirementProgress.deleteMany({});
    await ItemProgress.deleteMany({});
  });
});
