import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";
import { User } from "../../../../../src/model/users";
import { Item } from "../../../../../src/model/items";
import { expect } from "chai";
import { Clearance } from "../../../../../src/model/clearances";
import { Member } from "../../../../../src/model/members";
import { Group } from "../../../../../src/model/groups";
import {
  RequirementProgress,
  RequirementProgressModel,
} from "../../../../../src/model";

describe("# getProgress", () => {
  let requirement: RequirementModel;
  let memberID: string;

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

    await clearance.assignMember(member);
    await clearance.applyNewMember(memberID);
  });

  let progress: RequirementProgressModel;
  it("should not throw", async () => {
    progress = await requirement.getProgress(memberID);
  });

  it("should return the right progress", async () => {
    expect(progress.definition.toString()).to.be.equal(
      requirement._id.toString()
    );
    expect(progress.member.toString()).to.be.equal(memberID);
  });

  after(async () => {
    await RequirementProgress.deleteMany({});
    await Requirement.deleteMany({});
    await Clearance.deleteMany({});
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
    await Item.deleteMany({});
  });
});
