import { User } from "../../../../../src/model/users";
import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";
import { expect } from "chai";
import { ItemModel, Item } from "../../../../../src/model/items";
import { Member } from "../../../../../src/model/members";
import { Group } from "../../../../../src/model/groups";
import { Clearance } from "../../../../../src/model/clearances";

describe("# addItem", () => {
  let requirement: RequirementModel;
  let memberID: string;

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
  });

  let item: ItemModel;
  it("should not throw", async () => {
    item = await requirement.addItem("Sample Item", "Sample Item");
  });

  it("should have proper values.", () => {
    const itemObj = item.toObject();
    expect(itemObj.name).to.be.equal("Sample Item");
    expect(itemObj.description).to.be.equal("Sample Item");
    expect(itemObj.assignedMember.toString()).to.be.equal(memberID);
  });

  it("should update the group `members` property", () => {
    const requirementObj = requirement.toObject();
    expect(requirementObj.items.length).to.be.equal(1);
    expect(requirementObj.items[0].toString()).to.be.equal(item._id.toString());
  });

  after(async () => {
    await Requirement.deleteMany({});
    await Clearance.deleteMany({});
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
    await Item.deleteMany({});
  });
});
