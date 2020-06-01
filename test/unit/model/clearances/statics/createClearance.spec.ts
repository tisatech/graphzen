import { expect } from "chai";
import { ClearanceModel, Clearance } from "../../../../../src/model/clearances";
import { User } from "../../../../../src/model/users";
import { Member, Group } from "../../../../../src";

describe("# createClearance", () => {
  const testPayload: any = {
    name: "Sample Clearance",
    description: "Sample Clearance",
  };
  let clearance: ClearanceModel;

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
    await group.addMember();
    testPayload.scope_group = group._id.toString();
    testPayload.createdBy = user._id.toString();
  });

  it("should no throw error.", async () => {
    clearance = await Clearance.createClearance(testPayload);
  });

  it("should assign the correct values.", () => {
    const clearanceObj = clearance.toObject();
    expect(clearanceObj.name).to.be.equal(testPayload.name);
    expect(clearanceObj.description).to.be.equal(testPayload.description);
    expect(clearanceObj.scope_group.toString()).to.be.equal(
      testPayload.scope_group
    );
    expect(clearanceObj.createdBy.toString()).to.be.equal(
      testPayload.createdBy
    );
    expect(clearanceObj.isModifiedClearance).to.be.false;
  });

  it("should save new data in the database.", async () => {
    const clearanceDB = await Clearance.findOne({}).exec();
    expect(clearanceDB?.toObject()).to.be.eql(clearance.toObject());
  });

  after(async () => {
    await Clearance.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
