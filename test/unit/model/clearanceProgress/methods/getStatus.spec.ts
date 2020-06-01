import { expect } from "chai";
import { Item } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member, Group, GroupModel } from "../../../../../src";
import {
  ClearanceModel,
  Clearance,
  Requirement,
  ClearanceProgress,
  RequirementProgress,
  ItemProgress,
  ItemProgressModel,
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# getStatus", () => {
  let clearance: ClearanceModel;
  let member: MemberModel;
  let group: GroupModel;
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
    await clearance.assignMember(member);
    await clearance.applyNewMember(member._id.toString());
    clearanceProgress = await clearance.getProgress(member._id.toString());
  });

  describe("ACTIVE.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      clearanceProgress.status = "ACTIVE";
    });

    it("should not throw", async () => {
      status = await clearanceProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("ACTIVE");
    });
  });

  describe("PENDING.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      clearanceProgress.status = "PENDING";
    });

    it("should not throw", async () => {
      status = await clearanceProgress.getStatus();
    });

    it("should return the right value.", () => {
      expect(status).to.be.equal("PENDING");
    });
  });

  describe("CLEARED.", () => {
    let status: ItemProgressModel["status"];
    before(async () => {
      clearanceProgress.status = "CLEARED";
    });

    it("should not throw", async () => {
      status = await clearanceProgress.getStatus();
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
