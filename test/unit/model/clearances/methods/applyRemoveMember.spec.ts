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
  ItemModel,
} from "../../../../../src/model";

describe("# applyRemoveMember", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item: ItemModel;

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
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    item = await requirement.addItem("Sample Item", "Sample Item");

    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
  });

  it("should not throw", async () => {
    await clearance.applyRemoveMember(member._id.toString());
  });

  it("should propagate the whole tree.", async () => {
    const clearanceProgress = await ClearanceProgress.findOne({
      definition: clearance._id.toString(),
      member: member._id.toString(),
    }).exec();
    expect(clearanceProgress).to.not.exist;

    const requirementProgress = await RequirementProgress.findOne({
      definition: requirement._id.toString(),
      member: member._id.toString(),
    });
    expect(requirementProgress).to.not.exist;

    const itemProgress = await ItemProgress.findOne({
      definition: item._id.toString(),
      member: member._id.toString(),
    });
    expect(itemProgress).to.not.exist;
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
