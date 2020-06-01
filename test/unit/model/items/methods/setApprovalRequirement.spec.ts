import { User } from "../../../../../src/model/users";
import { Item, ItemModel } from "../../../../../src/model/items";
import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";
import {
  RequirementModel,
  Requirement,
} from "../../../../../src/model/requirements";

describe("# setApprovalRequirement", () => {
  let item: ItemModel;
  let memberID: string;
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
    memberID = member._id.toString();

    requirement = await Requirement.createRequirement({
      name: "Sample Requirement",
      assignedMember: memberID,
    });

    item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
  });

  it("should not throw", async () => {
    await item.setApprovalRequirement([requirement]);
  });

  it("should modify the correct values", () => {
    const itemObj = item.toObject();
    expect(itemObj.approvalType).to.be.equal("REQUIREMENT");
    expect(itemObj.approval).to.be.undefined;
    expect(itemObj.members.length).to.be.equal(0);
    expect(itemObj.clearances.length).to.be.equal(0);
    expect(itemObj.requirements.length).to.be.equal(1);
    expect(itemObj.requirements[0].toString()).to.be.equal(
      requirement._id.toString()
    );
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
    await Requirement.deleteMany({});
  });
});
