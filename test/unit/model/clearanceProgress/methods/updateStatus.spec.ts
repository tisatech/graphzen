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
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# updateStatus", () => {
  let clearance: ClearanceModel;
  let requirement1: RequirementModel;
  let requirement2: RequirementModel;
  let member: MemberModel;
  let group: GroupModel;

  let requirementProgress1: RequirementProgressModel;
  let requirementProgress2: RequirementProgressModel;
  let clearanceProgress: ClearanceProgressModel;
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
    requirement1 = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    requirement2 = await clearance.addRequirement(
      "Sample Requirement",
      member._id.toString()
    );
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
    clearanceProgress = await clearance.getProgress(member._id.toString());

    requirementProgress1 = (await RequirementProgress.findOne({
      definition: requirement1._id.toString(),
      member: member._id.toString(),
    }).exec()) as RequirementProgressModel;

    requirementProgress2 = (await RequirementProgress.findOne({
      definition: requirement2._id.toString(),
      member: member._id.toString(),
    }).exec()) as RequirementProgressModel;
  });

  describe("Both are ACTIVE.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "ACTIVE";
      requirementProgress2.status = "ACTIVE";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "ACTIVE"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "ACTIVE"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("ACTIVE");
    });
  });
  describe("Both are PENDING.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "PENDING";
      requirementProgress2.status = "PENDING";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "PENDING"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "PENDING"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("PENDING");
    });
  });
  describe("Both are CLEARED.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "CLEARED";
      requirementProgress2.status = "CLEARED";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "CLEARED"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "CLEARED"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("CLEARED");
    });
  });
  describe("ACTIVE and PENDING = ACTIVE.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "ACTIVE";
      requirementProgress2.status = "PENDING";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "ACTIVE"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "PENDING"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("ACTIVE");
    });
  });
  describe("ACTIVE and CLEARED = ACTIVE.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "ACTIVE";
      requirementProgress2.status = "CLEARED";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "ACTIVE"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "CLEARED"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("ACTIVE");
    });
  });
  describe("PENDING and CLEARED = PENDING.", () => {
    it("should not throw", async () => {
      requirementProgress1.status = "PENDING";
      requirementProgress2.status = "CLEARED";
      await requirementProgress1.save();
      await requirementProgress2.save();
      await clearanceProgress.updateStatus(
        requirementProgress1._id.toString(),
        "PENDING"
      );
      await clearanceProgress.updateStatus(
        requirementProgress2._id.toString(),
        "CLEARED"
      );
    });

    it("should update the correct state.", async () => {
      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("PENDING");
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
