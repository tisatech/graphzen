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
  ClearanceProgressModel,
} from "../../../../../src/model";

describe("# createRequirementProgress", () => {
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
  });

  it("should not throw", async () => {
    clearanceProgress = await ClearanceProgress.createClearanceProgress({
      member: member._id.toString(),
      definition: clearance._id.toString(),
    });
  });

  it("should return the correct values", () => {
    const clearanceProgressObj = clearanceProgress.toObject();
    expect(clearanceProgressObj.member.toString()).to.be.equal(
      member._id.toString()
    );
    expect(clearanceProgressObj.definition.toString()).to.be.equal(
      clearance._id.toString()
    );
    expect(clearanceProgressObj.status).to.be.equal("ACTIVE");
  });

  it("should save new data in the database.", async () => {
    const clearanceProgresssDB = await ClearanceProgress.findOne({}).exec();
    expect(clearanceProgresssDB?.toObject()).to.be.eql(
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
