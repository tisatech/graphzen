import { expect } from "chai";
import { ItemModel, Item } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { MemberModel, Member, Group } from "../../../../../src";

describe("# createItem", () => {
  const testPayload: any = {
    name: "Sample Item",
    description: "Item description.",
  };
  let item: ItemModel;
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
    item = await Item.createItem(testPayload);
  });

  it("should assign the correct values.", () => {
    const itemObj = item.toObject();
    expect(itemObj.name).to.be.equal(testPayload.name);
    expect(itemObj.description).to.be.equal(testPayload.description);
    expect(itemObj.assignedMember.toString()).to.be.equal(
      testPayload.assignedMember
    );
  });

  it("should save new data in the database.", async () => {
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
