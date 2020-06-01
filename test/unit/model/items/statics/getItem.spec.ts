import { expect } from "chai";
import { Item, ItemModel } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { Group, Member } from "../../../../../src";

describe("# getItem", () => {
  let item: ItemModel;

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

    // Create 2 dummy Items.
    for (let i = 0; i < 3; i++) {
      const tempItem = await Item.createItem({
        name: `Sample Item ${i}`,
        description: `Description ${i}`,
        assignedMember: member._id.toString(),
      });

      if (i == 0) item = tempItem;
    }
  });

  it("should return the correct Item", async () => {
    const itemDB = await Item.getItem(item._id.toString());
    expect(itemDB.toObject()).to.be.eql(item.toObject());
  });

  after(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
