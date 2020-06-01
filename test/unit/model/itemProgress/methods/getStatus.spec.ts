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
  ItemProgressModel,
} from "../../../../../src/model";

describe("# getStatus", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item: ItemModel;
  let member: MemberModel;
  let group: GroupModel;

  let itemProgress: ItemProgressModel;

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
    item = await requirement.addItem("Sample Item", "Sample Item");
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());

    itemProgress = (await ItemProgress.findOne({
      definition: item._id.toString(),
      member: member._id.toString(),
    }).exec()) as ItemProgressModel;
  });

  describe("ACTIVE.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      await itemProgress.setStatus("ACTIVE");
    });

    it("should not throw", async () => {
      status = await itemProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("ACTIVE");
    });
  });

  describe("PENDING.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      await itemProgress.setStatus("PENDING");
    });

    it("should not throw", async () => {
      status = await itemProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("PENDING");
    });
  });

  describe("CLEARED.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      await itemProgress.setStatus("CLEARED");
    });

    it("should not throw", async () => {
      status = await itemProgress.getStatus();
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
