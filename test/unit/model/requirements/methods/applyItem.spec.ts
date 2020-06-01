import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";
import { User } from "../../../../../src/model/users";
import { Item } from "../../../../../src/model/items";
import { expect } from "chai";
import { Clearance } from "../../../../../src/model/clearances";
import { Member } from "../../../../../src/model/members";
import { Group } from "../../../../../src/model/groups";
import { RequirementProgress, ItemProgress } from "../../../../../src/model";

describe("# applyItem", () => {
  let requirement: RequirementModel;
  let memberID: string;
  let itemID: string;

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
    const member = await group.addMember(user);
    memberID = member._id.toString();

    const clearance = await group.addClearance({
      name: "Sample Clearance",
      description: "Sample Clearance",
      createdBy: user._id.toString(),
    });
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      memberID
    );
    await clearance.assignMember(member);
    await clearance.applyNewMember(memberID);
    const item = await requirement.addItem("Sample Item", "Sample Item");
    itemID = item._id.toString();
  });

  it("should not throw", async () => {
    await requirement.applyNewItem(itemID);
  });

  it("should propagate progress", async () => {
    const itemProgress = await ItemProgress.findOne({}).exec();
    expect(itemProgress?.definition.toString()).to.be.equal(itemID);
    expect(itemProgress?.member.toString()).to.be.equal(memberID);
  });

  after(async () => {
    await RequirementProgress.deleteMany({});
    await Requirement.deleteMany({});
    await Clearance.deleteMany({});
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
    await Item.deleteMany({});
    await ItemProgress.deleteMany({});
  });
});
