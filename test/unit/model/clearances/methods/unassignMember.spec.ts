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

describe("# unassignMember", () => {
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

  it("should throw when unassigning non-existent member.", async () => {
    await expect(clearance.unassignMember("NonExistentID")).to.be.eventually
      .rejected;
  });

  it("should throw when unassigning member inside a group.", async () => {
    await clearance.assignGroup(group._id.toString());
    await expect(clearance.unassignMember(member._id.toString())).to.be
      .eventually.rejected;
    await clearance.unassignGroup(group._id.toString());
  });

  it("should not throw.", async () => {
    await clearance.assignMember(member);
    await clearance.unassignMember(member._id.toString());
  });

  it("should update the document", async () => {
    expect(clearance.assignedMembers.length).to.be.equal(0);
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
