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
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# getProgress", () => {
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
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
  });

  it("should throw for non-existent members.", async () => {
    await expect(clearance.getProgress("Non-existent-id")).to.be.eventually
      .rejected;
  });

  let clearanceProgress: ClearanceProgressModel;
  it("should not throw", async () => {
    clearanceProgress = await clearance.getProgress(member._id.toString());
  });

  it("should return the correct progress", () => {
    expect(clearanceProgress.definition.toString()).to.be.equal(
      clearance._id.toString()
    );
    expect(clearanceProgress.member.toString()).to.be.equal(
      member._id.toString()
    );
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
