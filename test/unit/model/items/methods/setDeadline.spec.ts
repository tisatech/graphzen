import { User } from "../../../../../src/model/users";
import { Item, ItemModel } from "../../../../../src/model/items";
import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";

describe("# setDeadline", () => {
  let item: ItemModel;
  const deadline = new Date();

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
    item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
  });

  it("should not throw", async () => {
    await item.setDeadline(deadline);
  });

  it("should modify the correct values", () => {
    expect(item.hasDeadline).to.be.equal(true);
    expect(item.deadline?.toUTCString()).to.be.equal(deadline.toUTCString());
  });

  after(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
