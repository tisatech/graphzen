import { expect } from "chai";
import { Item } from "../../../../../src/model/items";
import { User } from "../../../../../src/model/users";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";

describe("# updateItem", () => {
  let _id: string;
  const updatePayload = {
    name: "Update Item name.",
    description: "Updated Item description.",
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

    const item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
    _id = item._id.toString();
  });

  it("should no throw error.", async () => {
    await Item.updateItem(_id, updatePayload);
  });

  it("should update the correct values in the database.", async () => {
    const item = await Item.findById(_id).exec();
    expect(item?.name).to.be.equal(updatePayload.name);
    expect(item?.description).to.be.equal(updatePayload.description);
  });

  after(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
