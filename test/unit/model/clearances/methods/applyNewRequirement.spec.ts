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
  RequirementModel,
} from "../../../../../src/model";

describe("# applyNewRequirement", () => {
  let clearance: ClearanceModel;

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
    await clearance.addRequirement("Sample Requirement", member._id.toString());
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
  });

  let newRequirement: RequirementModel;
  it("should not throw", async () => {
    newRequirement = await clearance.addRequirement(
      "New Requirement",
      member._id.toString()
    );
    await clearance.applyNewRequirement(newRequirement._id.toString());
  });

  it("should propagate.", async () => {
    const requirementProgress = await RequirementProgress.findOne({
      definition: newRequirement._id.toString(),
      member: member._id.toString(),
    });
    expect(requirementProgress).to.exist;
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
