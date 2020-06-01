import { expect } from "chai";
import { Item } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member, Group, GroupModel } from "../../../../../src";
import {
  ClearanceModel,
  RequirementModel,
  Clearance,
  Requirement,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
  RequirementProgressModel,
  ItemProgressModel,
} from "../../../../../src/model";

describe("# getStatus", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let member: MemberModel;
  let group: GroupModel;

  let requirementProgress: RequirementProgressModel;

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
    requirement = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    await requirement.addItem("Sample Item", "Sample Item");
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());

    requirementProgress = (await RequirementProgress.findOne({
      definition: requirement._id.toString(),
      member: member._id.toString(),
    }).exec()) as RequirementProgressModel;
  });

  describe("ACTIVE.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      requirementProgress.status = "ACTIVE";
    });

    it("should not throw", async () => {
      status = await requirementProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("ACTIVE");
    });
  });

  describe("PENDING.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      requirementProgress.status = "PENDING";
    });

    it("should not throw", async () => {
      status = await requirementProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("PENDING");
    });
  });

  describe("CLEARED.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      requirementProgress.status = "CLEARED";
    });

    it("should not throw", async () => {
      status = await requirementProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("CLEARED");
    });
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
