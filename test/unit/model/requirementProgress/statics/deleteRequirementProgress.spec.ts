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
  RequirementProgressModel,
  RequirementModel,
  MemberModel,
  GroupModel,
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# deleteRequirementProgress", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let requirementProgress: RequirementProgressModel;

  let member: MemberModel;
  let group: GroupModel;

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
    member = await group.addMember();
    clearance = await group.addClearance({
      name: `Sample Clearance`,
      description: `Sample Clearance`,
      createdBy: user._id.toString(),
    });
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());

    const clearanceProgress = (await ClearanceProgress.findOne({
      member: member._id.toString(),
      definition: clearance._id.toString(),
    }).exec()) as ClearanceProgressModel;
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    requirementProgress = await RequirementProgress.createRequirementProgress({
      member: member._id.toString(),
      parent: clearanceProgress._id.toString(),
      definition: requirement._id.toString(),
    });
  });

  it("should not throw", async () => {
    await RequirementProgress.deleteRequirementProgress(
      requirementProgress._id.toString()
    );
  });

  it("should remove document from the database.", async () => {
    const requirementProgress = await RequirementProgress.findOne({});
    expect(requirementProgress).to.not.exist;
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
