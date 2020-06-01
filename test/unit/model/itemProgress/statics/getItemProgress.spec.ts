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
  ItemModel,
  MemberModel,
  GroupModel,
  ItemProgressModel,
} from "../../../../../src/model";

describe("# getItemProgress", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item: ItemModel;
  let requirementProgress: RequirementProgressModel;

  let member: MemberModel;
  let group: GroupModel;
  let itemProgress: ItemProgressModel;

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
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());

    requirementProgress = (await RequirementProgress.findOne({
      definition: requirement._id.toString(),
      member: member._id.toString(),
    }).exec()) as RequirementProgressModel;

    item = await requirement.addItem("Sample Item", "Sample Item");
    itemProgress = await ItemProgress.createItemProgress({
      member: member._id.toString(),
      parent: requirementProgress._id.toString(),
      definition: item._id.toString(),
    });
  });

  it("should return the correct ItemProgress", async () => {
    const itemProgressDB = await ItemProgress.getItemProgress(
      itemProgress._id.toString()
    );
    expect(itemProgressDB.toObject()).to.be.eql(itemProgress.toObject());
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
