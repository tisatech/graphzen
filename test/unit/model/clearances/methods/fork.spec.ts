import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";
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
  RequirementModel,
  ItemModel,
} from "../../../../../src/model";

describe("# fork", () => {
  let clearance: ClearanceModel;
  let requirement: RequirementModel;
  let item: ItemModel;

  let user: UserModel;
  let member: MemberModel;
  let group: GroupModel;

  before(async () => {
    user = await User.createUser({
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
  });

  let clearanceFork: ClearanceModel;
  it("should not throw", async () => {
    clearanceFork = await clearance.fork(
      user._id.toString(),
      group._id.toString()
    );
  });

  it("should have the correct values", async () => {
    expect(clearanceFork.name).to.be.equal("Sample Clearance");
    expect(clearanceFork.description).to.be.equal("Sample Clearance");
    expect(clearanceFork.createdBy.toString()).to.be.equal(user._id.toString());
    expect(clearanceFork.scope_group.toString()).to.be.equal(
      group._id.toString()
    );
  });

  it("should copy the whole tree", async () => {
    const requirementFork = await Requirement.findOne({
      clearance: clearanceFork._id.toString(),
    }).exec();
    if (!requirementFork) {
      throw new Error("RequirementFork should exist.");
    }
    expect(requirementFork.name).to.be.equal("Sample Requirement");
    expect(requirementFork.assignedMember.toString()).to.be.equal(
      member._id.toString()
    );

    const itemFork = await Item.getItem(requirementFork.items[0].toString());
    if (!itemFork) {
      throw new Error("ItemFork should exist.s");
    }
    const itemForkObj = itemFork.toObject();
    const itemObj = item.toObject();
    expect(itemForkObj.name).to.be.equal(itemObj.name);
    expect(itemForkObj.description).to.be.equal(itemObj.description);
    expect(itemForkObj.approval).to.be.equal(itemObj.approval);
    expect(itemForkObj.approvalType).to.be.equal(itemObj.approvalType);
    expect(itemForkObj.deadline).to.be.equal(itemObj.deadline);
    expect(itemForkObj.hasDeadline).to.be.equal(itemObj.hasDeadline);
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
