import { expect } from "chai";
import { ItemModel, Item } from "../../../../../src/model/items";
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
  ItemProgressModel,
} from "../../../../../src/model";

describe("# createItemProgress", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item: ItemModel;
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
  });

  let itemProgress: ItemProgressModel;
  it("should not throw", async () => {
    itemProgress = await ItemProgress.createItemProgress({
      member: member._id.toString(),
      parent: requirementProgress._id.toString(),
      definition: item._id.toString(),
    });
  });

  it("should return the correct values", () => {
    const itemProgressObj = itemProgress.toObject();
    expect(itemProgressObj.member.toString()).to.be.equal(
      member._id.toString()
    );
    expect(itemProgressObj.parent.toString()).to.be.equal(
      requirementProgress._id.toString()
    );
    expect(itemProgressObj.definition.toString()).to.be.equal(
      item._id.toString()
    );
    expect(itemProgressObj.status).to.be.equal("ACTIVE");
  });

  it("should save new data in the database.", async () => {
    const itemProgressDB = await ItemProgress.findOne({}).exec();
    expect(itemProgressDB?.toObject()).to.be.eql(itemProgress.toObject());
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
