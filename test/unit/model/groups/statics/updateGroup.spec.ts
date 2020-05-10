import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";

describe("# updateGroup", () => {
  let _id: string;
  const updatePayload = {
    name: "Update Group name.",
    description: "Updated Group description.",
  };

  before(async () => {
    const testPayload: any = {
      name: "Sample Group",
      description: "Group description.",
    };
    const user = await User.createUser({
      name: "Sample name",
      email: "sample@sample.com",
      password: "sample-password",
    });
    testPayload.createdBy = user._id.toString();
    const group = await Group.createGroup(testPayload);
    _id = group._id.toString();
  });

  it("should no throw error.", async () => {
    await Group.updateGroup(_id, updatePayload);
  });

  it("should update the correct values in the database.", async () => {
    const group = await Group.findById(_id).exec();
    expect(group?.name).to.be.equal(updatePayload.name);
    expect(group?.description).to.be.equal(updatePayload.description);
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
