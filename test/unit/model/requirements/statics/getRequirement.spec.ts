import { expect } from "chai";
import { User } from "../../../../../src/model/users";
import { Group, Member } from "../../../../../src";
import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";

describe("# getRequirement", () => {
  let requirement: RequirementModel;

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
    const member = await group.addMember();

    // Create 2 dummy Requirements.
    for (let i = 0; i < 3; i++) {
      const tempRequirement = await Requirement.createRequirement({
        name: `Sample Requirement ${i}`,
        assignedMember: member._id.toString(),
      });

      if (i == 0) requirement = tempRequirement;
    }
  });

  it("should return the correct Requirement", async () => {
    const RequirementDB = await Requirement.getRequirement(
      requirement._id.toString()
    );
    expect(RequirementDB.toObject()).to.be.eql(requirement.toObject());
  });

  after(async () => {
    await Requirement.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
