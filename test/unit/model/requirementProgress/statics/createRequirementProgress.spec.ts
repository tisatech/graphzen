import { expect } from "chai";
import { Item } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member, Group, GroupModel } from "../../../../../src";
import {
  ClearanceModel,
  RequirementModel,
  Clearance,
  Requirement,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
  RequirementProgressModel,
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# createRequirementProgress", () => {
  let clearance: ClearanceModel;
  let clearanceProgress: ClearanceProgressModel;
  let requirement: RequirementModel;
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

    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );

    clearanceProgress = (await ClearanceProgress.findOne({
      member: member._id.toString(),
      definition: clearance._id.toString(),
    }).exec()) as ClearanceProgressModel;
  });

  let requirementProgress: RequirementProgressModel;
  it("should not throw", async () => {
    requirementProgress = await RequirementProgress.createRequirementProgress({
      member: member._id.toString(),
      parent: clearanceProgress._id.toString(),
      definition: requirement._id.toString(),
    });
  });

  it("should return the correct values", () => {
    const requirementProgressProgressObj = requirementProgress.toObject();
    expect(requirementProgressProgressObj.member.toString()).to.be.equal(
      member._id.toString()
    );
    expect(requirementProgressProgressObj.parent.toString()).to.be.equal(
      clearanceProgress._id.toString()
    );
    expect(requirementProgressProgressObj.definition.toString()).to.be.equal(
      requirement._id.toString()
    );
    expect(requirementProgressProgressObj.status).to.be.equal("ACTIVE");
  });

  it("should save new data in the database.", async () => {
    const requirementProgressProgressDB = await RequirementProgress.findOne(
      {}
    ).exec();
    expect(requirementProgressProgressDB?.toObject()).to.be.eql(
      requirementProgress.toObject()
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
