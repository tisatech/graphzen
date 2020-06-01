import { expect } from "chai";
import { Requirement } from "../../../../../src/model/requirements";
import { User } from "../../../../../src/model/users";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";

describe("# updateRequirement", () => {
  let _id: string;
  const updatePayload = {
    name: "Update Requirement name.",
  };

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
    const requirement = await Requirement.createRequirement({
      name: `Sample Requirement`,
      assignedMember: member._id.toString(),
    });
    _id = requirement._id.toString();
  });

  it("should not throw error.", async () => {
    await Requirement.updateRequirement(_id, updatePayload);
  });

  it("should update the correct values in the database.", async () => {
    const requirement = await Requirement.findById(_id).exec();
    expect(requirement?.name).to.be.equal(updatePayload.name);
  });

  after(async () => {
    await Requirement.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
