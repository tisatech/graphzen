import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { Requirement } from "../../../../../src/model/requirements";
import { Member } from "../../../../../src";
import {
  Clearance,
  Item,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
} from "../../../../../src/model";

describe("# deleteClearance", () => {
  let _id: string;

  before(async () => {
    const user = await User.createUser({
      name: "Sample name",
      email: "sample@sample.com",
      password: "sample-password",
    });
    const group = await user.createGroup({
      name: "Sample Group",
      description: "Sample Group",
    });
    const member = await group.addMember();

    const clearance = await group.addClearance({
      name: "Sample Clearance",
      description: "Sample Clearance",
      createdBy: user._id.toString(),
    });
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
    const requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    await clearance.applyNewRequirement(requirement._id.toString());

    const item = await requirement.addItem("Sample Item", "Sample Item");
    await requirement.applyNewItem(item._id.toString());

    _id = clearance._id.toString();
  });

  it("should not throw.", async () => {
    await Clearance.deleteClearance(_id);
  });

  it("should remove clearance from the database.", async () => {
    const clearanceDB = await Clearance.findOne({}).exec();
    expect(clearanceDB).to.not.exist;
  });

  it("should remove clearanceProgress from the database.", async () => {
    const clearanceProgressDB = await ClearanceProgress.findOne({}).exec();
    expect(clearanceProgressDB).to.not.exist;
  });

  it("should remove Requirement from the database.", async () => {
    const requirementDB = await Requirement.findOne({}).exec();
    expect(requirementDB).to.not.exist;
  });

  it("should remove RequirementProgress from the database.", async () => {
    const requirementProgressDB = await RequirementProgress.findOne({}).exec();
    expect(requirementProgressDB).to.not.exist;
  });

  it("should remove items from the database.", async () => {
    const itemDB = await Item.findOne({}).exec();
    expect(itemDB).to.not.exist;
  });

  it("should remove itemProgress from the database.", async () => {
    const itemProgressDB = await ItemProgress.findOne({}).exec();
    expect(itemProgressDB).to.not.exist;
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
