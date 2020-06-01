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
} from "../../../../../src/model";

describe("# getClearance", () => {
  let clearance: ClearanceModel;

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
    // Create 2 dummy Clearances.
    for (let i = 0; i < 3; i++) {
      const tempClearance = await group.addClearance({
        name: `Sample Clearance ${i}`,
        description: `Sample Clearance`,
        createdBy: user._id.toString(),
      });

      if (i == 0) clearance = tempClearance;
    }
  });

  it("should return the correct Clearance", async () => {
    const clearanceDB = await Clearance.getClearance(clearance._id.toString());
    expect(clearanceDB.toObject()).to.be.eql(clearance.toObject());
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
