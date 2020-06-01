import { expect } from "chai";
import { GroupModel, Group } from "../../../../../src/model/groups";
import { User } from "../../../../../src/model/users";
import { ClearanceModel, Clearance } from "../../../../../src/model/clearances";

describe("# addClearance", () => {
  let group: GroupModel;
  let userID: string;
  before(async () => {
    const user = await User.createUser({
      name: "Sample User",
      email: "email@email.com",
      password: "password",
    });
    userID = user._id.toString();

    group = await Group.createGroup({
      name: "Sample Group",
      description: "Sample group",
      createdBy: user._id.toString(),
    });
  });
  let clearance: ClearanceModel;
  it("should not throw", async () => {
    clearance = await group.addClearance({
      name: "Sample Clearance",
      description: "Sample Clearance",
      createdBy: userID,
    });
  });

  it("should have proper values.", () => {
    expect(clearance.scope_group.toString()).to.be.equal(group._id.toString());
    expect(clearance.createdBy.toString()).to.be.equal(userID);
    expect(clearance.name).to.be.equal("Sample Clearance");
    expect(clearance.description).to.be.equal("Sample Clearance");
  });

  it("should update the group `clearances` property", () => {
    expect(group.clearances.length).to.be.equal(1);
    expect(group.clearances[0].toString()).to.be.equal(
      clearance._id.toString()
    );
  });

  after(async () => {
    await Clearance.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
