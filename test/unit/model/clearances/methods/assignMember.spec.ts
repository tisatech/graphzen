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
  MemberModel,
  GroupModel,
} from "../../../../../src/model";

describe("# assignMember", () => {
  let clearance: ClearanceModel;
  let member: MemberModel;
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
    member = await group.addMember();
    clearance = await group.addClearance({
      name: `Sample Clearance`,
      description: `Sample Clearance`,
      createdBy: user._id.toString(),
    });
  });

  it("should not throw", async () => {
    await clearance.assignMember(member);
  });

  it("should update the document", async () => {
    expect(clearance.assignedMembers.length).to.be.equal(1);
    expect(clearance.assignedMembers[0].toString()).to.be.equal(
      member._id.toString()
    );
    expect(clearance.isModifiedClearance).to.be.true;
  });

  it("should throw when adding members again", async () => {
    await expect(clearance.assignMember(member)).to.be.eventually.rejected;
  });

  it("should throw when member is inside unassigned groups", async () => {
    await clearance.unassignMember(member._id.toString());
    await clearance.assignGroup(group._id.toString());
    await expect(clearance.assignMember(member)).to.be.eventually.rejected;
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
