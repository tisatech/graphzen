import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { Item } from "../../../../../src/model/items";
import { Member } from "../../../../../src";
import {
  ItemProgress,
  Clearance,
  ClearanceProgress,
  Requirement,
  RequirementProgress,
} from "../../../../../src/model";

describe("# deleteItem", () => {
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
    _id = item._id.toString();
  });

  it("should not throw.", async () => {
    await Item.deleteItem(_id);
  });

  it("should remove item from the database.", async () => {
    const itemDB = await Item.findById(_id).exec();
    expect(itemDB).to.not.exist;
  });

  it("should remove itemProgress from the database.", async () => {
    const itemProgressDB = await ItemProgress.findById(_id).exec();
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
