import { expect } from "chai";
import { Clearance } from "../../../../../src/model/clearances";
import { User } from "../../../../../src/model/users";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";
import {
  Requirement,
  Item,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
} from "../../../../../src/model";

describe("# updateClearance", () => {
  let _id: string;
  const updatePayload = {
    name: "Update Clearance name",
    description: "Update clearance description",
  };

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
    const clearance = await group.addClearance({
      name: `Sample Clearance`,
      description: `Sample Clearance`,
      createdBy: user._id.toString(),
    });
    _id = clearance._id.toString();
  });

  it("should not throw error.", async () => {
    await Clearance.updateClearance(_id, updatePayload);
  });

  it("should update the correct values in the database.", async () => {
    const clearance = await Clearance.findById(_id).exec();
    expect(clearance?.name).to.be.equal(updatePayload.name);
    expect(clearance?.description).to.be.equal(updatePayload.description);
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
