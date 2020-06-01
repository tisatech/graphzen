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

describe("# assignGroup", () => {
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
  });

  it("should not throw", async () => {
    await clearance.assignGroup(group._id.toString());
  });

  it("should update the group", async () => {
    expect(clearance.assignedGroups.length).to.be.equal(1);
    expect(clearance.assignedGroups[0].toString()).to.be.equal(
      group._id.toString()
    );
    expect(clearance.isModifiedClearance).to.be.true;
  });

  it("should absorb the members", async () => {
    expect(clearance.assignedMembers.length).to.be.equal(0);
  });

  it("should throw when adding the group again", async () => {
    await expect(clearance.assignGroup(group._id.toString())).to.be.eventually
      .rejected;
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
