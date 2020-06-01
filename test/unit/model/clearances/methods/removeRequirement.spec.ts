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

describe("# removeRequirement", () => {
  let clearance: ClearanceModel;
  let member: MemberModel;
  let group: GroupModel;
  let requirement: RequirementModel;

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
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
  });

  it("should throw for nonexistent requirement", async () => {
    await expect(clearance.removeRequirement("NonExistentID")).to.be.eventually
      .rejected;
  });

  it("should not throw", async () => {
    await clearance.removeRequirement(requirement._id.toString());
  });

  it("should remove the requirement in the database", async () => {
    const requirement = await Requirement.findOne({});
    expect(requirement).to.not.exist;
  });

  it("should remove from the `requirements` list.", async () => {
    expect(clearance.requirements.length).to.be.equal(0);
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
