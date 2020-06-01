import { expect } from "chai";
import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member, Group } from "../../../../../src";

describe("# createRequirement", () => {
  const testPayload: any = {
    name: "Sample Requirement",
  };
  let requirement: RequirementModel;
  let member: MemberModel;

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
    member = await group.addMember();
    testPayload.assignedMember = member._id.toString();
  });

  it("should no throw error.", async () => {
    requirement = await Requirement.createRequirement(testPayload);
  });

  it("should assign the correct values.", () => {
    const requirementObj = requirement.toObject();
    expect(requirementObj.name).to.be.equal(testPayload.name);
    expect(requirementObj.assignedMember.toString()).to.be.equal(
      testPayload.assignedMember
    );
  });

  it("should save new data in the database.", async () => {
    const requirementDB = await Requirement.findOne({}).exec();
    expect(requirementDB?.toObject()).to.be.eql(requirement.toObject());
  });

  after(async () => {
    await Requirement.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
