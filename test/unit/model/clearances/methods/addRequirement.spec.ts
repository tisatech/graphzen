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

describe("# addRequirement", () => {
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
  });

  let requirement: RequirementModel;
  it("should not throw", async () => {
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
  });

  it("should have proper values.", () => {
    const requirementObj = requirement.toObject();
    expect(requirementObj.name).to.be.equal("Sample Requirement");
    expect(requirementObj.assignedMember.toString()).to.be.equal(
      member._id.toString()
    );
    expect(requirementObj.clearance.toString()).to.be.equal(
      clearance._id.toString()
    );
  });

  it("should update the group `requirements` property", () => {
    const clearanceObj = clearance.toObject();
    expect(clearanceObj.requirements.length).to.be.equal(1);
    expect(clearanceObj.requirements[0].toString()).to.be.equal(
      requirement._id.toString()
    );
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
