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

describe("# reorderItems", () => {
  let requirement: RequirementModel;
  let memberID: string;
  const items: ItemModel[] = [];

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

    items.push(await requirement.addItem("Item 1", "Sample Item 1"));
    items.push(await requirement.addItem("Item 2", "Sample Item 2"));
    items.push(await requirement.addItem("Item 3", "Sample Item 3"));
  });

  it("should throw when item lengths are different.", async () => {
    await expect(
      requirement.reorderItems([
        items[2]._id.toString(),
        items[1]._id.toString(),
      ])
    ).to.be.eventually.rejected;
  });

  it("should throw when some IDs are not present.", async () => {
    await expect(
      requirement.reorderItems([
        items[2]._id.toString(),
        items[1]._id.toString(),
        "nonExistentIdea",
      ])
    ).to.be.eventually.rejected;
  });

  it("should not throw", async () => {
    await requirement.reorderItems([
      items[2]._id.toString(),
      items[0]._id.toString(),
      items[1]._id.toString(),
    ]);
  });

  it("should reorder items.", () => {
    expect(requirement.items.length).to.be.equal(3);
    expect(requirement.items[0].toString()).to.be.equal(
      items[2]._id.toString()
    );
    expect(requirement.items[1].toString()).to.be.equal(
      items[0]._id.toString()
    );
    expect(requirement.items[2].toString()).to.be.equal(
      items[1]._id.toString()
    );
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
