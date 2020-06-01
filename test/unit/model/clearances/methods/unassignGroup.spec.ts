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
  GroupModel,
} from "../../../../../src/model";

describe("# unassignGroup", () => {
  let clearance: ClearanceModel;
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
    await group.addMember();
    clearance = await group.addClearance({
      name: `Sample Clearance`,
      description: `Sample Clearance`,
      createdBy: user._id.toString(),
    });
    await clearance.assignGroup(group);
  });

  it("should throw when unassigning non-existent group.", async () => {
    await expect(clearance.unassignGroup("NonExistentID")).to.be.eventually
      .rejected;
  });

  it("should not throw.", async () => {
    await clearance.unassignGroup(group._id.toString());
  });

  it("should update the document", async () => {
    expect(clearance.assignedGroups.length).to.be.equal(0);
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
