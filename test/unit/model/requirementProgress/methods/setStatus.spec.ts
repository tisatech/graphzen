import { expect } from "chai";
import { ItemModel, Item } from "../../../../../src/model/items";
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
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# setStatus", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item1: ItemModel;
  let item2: ItemModel;
  let member: MemberModel;
  let group: GroupModel;

  let clearanceProgress: ClearanceProgressModel;
  let requirementProgress: RequirementProgressModel;
  let itemProgress1: ItemProgressModel;
  let itemProgress2: ItemProgressModel;

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
    item1 = await requirement.addItem("Sample Item", "Sample Item");
    item2 = await requirement.addItem("Sample Item", "Sample Item");
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());

    itemProgress1 = (await ItemProgress.findOne({
      definition: item1._id.toString(),
      member: member._id.toString(),
    }).exec()) as ItemProgressModel;
    itemProgress2 = (await ItemProgress.findOne({
      definition: item2._id.toString(),
      member: member._id.toString(),
    }).exec()) as ItemProgressModel;
    clearanceProgress = await clearance.getProgress(member._id.toString());
    requirementProgress = (await RequirementProgress.findOne({
      definition: requirement._id.toString(),
      member: member._id.toString(),
    }).exec()) as RequirementProgressModel;
  });

  describe("Both are ACTIVE.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "ACTIVE";
      itemProgress2.status = "ACTIVE";
      await itemProgress1.save();
      await itemProgress2.save();

      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "ACTIVE"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "ACTIVE"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("ACTIVE");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("ACTIVE");
    });
  });

  describe("CLEARED -> ACTIVE.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "CLEARED";
      itemProgress2.status = "ACTIVE";
      await itemProgress1.save();
      await itemProgress2.save();
      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "CLEARED"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "ACTIVE"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("ACTIVE");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("ACTIVE");
    });
  });

  describe("PENDING -> ACTIVE.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "PENDING";
      itemProgress2.status = "ACTIVE";
      await itemProgress1.save();
      await itemProgress2.save();
      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "PENDING"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "ACTIVE"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("PENDING");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("PENDING");
    });
  });

  describe("CLEARED -> PENDING.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "CLEARED";
      itemProgress2.status = "PENDING";
      await itemProgress1.save();
      await itemProgress2.save();
      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "CLEARED"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "PENDING"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("PENDING");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("PENDING");
    });
  });

  describe("Both are PENDING.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "PENDING";
      itemProgress2.status = "PENDING";
      await itemProgress1.save();
      await itemProgress2.save();
      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "PENDING"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "PENDING"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("PENDING");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("PENDING");
    });
  });

  describe("Both are CLEARED.", () => {
    it("should not throw", async () => {
      itemProgress1.status = "CLEARED";
      itemProgress2.status = "CLEARED";
      await itemProgress1.save();
      await itemProgress2.save();
      const requirementProgressDB = await RequirementProgress.getRequirementProgress(
        requirementProgress._id.toString()
      );
      await requirementProgressDB.updateStatus(
        itemProgress1._id.toString(),
        "CLEARED"
      );
      await requirementProgressDB.updateStatus(
        itemProgress2._id.toString(),
        "CLEARED"
      );
    });

    it("should update the correct state.", async () => {
      const requirementProgressDB = await RequirementProgress.findById(
        requirementProgress._id.toString()
      ).exec();
      expect(requirementProgressDB?.status).to.be.equal("CLEARED");

      const clearanceProgressDB = await ClearanceProgress.findById(
        clearanceProgress._id.toString()
      ).exec();
      expect(clearanceProgressDB?.status).to.be.equal("CLEARED");
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
