import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";
import { User } from "../../../../../src/model/users";
import { ItemModel, Item } from "../../../../../src/model/items";
import { expect } from "chai";
import { Clearance } from "../../../../../src/model/clearances";
import { Member } from "../../../../../src/model/members";
import { Group } from "../../../../../src/model/groups";

describe("# removeMember", () => {
  let requirement: RequirementModel;
  let memberID: string;
  let item: ItemModel;

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
    item = await requirement.addItem("Sample Item", "Sample Item");
  });

  it("should not throw", async () => {
    await requirement.removeItem(item._id.toString());
  });

  it("should remove the item in the database", async () => {
    const item = await Item.findOne({});
    expect(item).to.not.exist;
  });

  it("should remove from the `items` list.", async () => {
    expect(requirement.items.length).to.be.equal(0);
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
