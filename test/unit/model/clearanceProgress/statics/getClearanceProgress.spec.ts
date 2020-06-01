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

describe("# getClearanceProgress", () => {
  let clearance: ClearanceModel;
  let clearanceProgress: ClearanceProgressModel;

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
    clearanceProgress = await ClearanceProgress.createClearanceProgress({
      member: member._id.toString(),
      definition: clearance._id.toString(),
    });
  });

  it("should return the correct ItemProgress", async () => {
    const clearanceProgressDB = await ClearanceProgress.getClearanceProgress(
      clearanceProgress._id.toString()
    );
    expect(clearanceProgressDB.toObject()).to.be.eql(
      clearanceProgress.toObject()
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
