import { User } from "../../../../../src/model/users";
import { Item, ItemModel } from "../../../../../src/model/items";
import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";
import { Clearance, ClearanceModel } from "../../../../../src/model/clearances";

describe("# setApprovalClearance", () => {
  let item: ItemModel;
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
    const member = await group.addMember();

    clearance = await Clearance.createClearance({
      name: "Sample clearance",
      description: "Sample Clearance",
      scope_group: group._id.toString(),
      createdBy: user._id.toString(),
    });

    item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
  });

  it("should not throw", async () => {
    await item.setApprovalClearance([clearance]);
  });

  it("should modify the correct values", () => {
    const itemObj = item.toObject();
    expect(itemObj.approvalType).to.be.equal("CLEARANCE");
    expect(itemObj.approval).to.not.exist;
    expect(itemObj.members.length).to.be.equal(0);
    expect(itemObj.clearances.length).to.be.equal(1);
    expect(itemObj.clearances[0].toString()).to.be.equal(
      clearance._id.toString()
    );
    expect(itemObj.requirements.length).to.be.equal(0);
  });

  it("should save the value in the database", async () => {
    const itemDB = await Item.findOne({}).exec();
    expect(itemDB?.toObject()).to.be.eql(item.toObject());
  });

  after(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
