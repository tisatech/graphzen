import { User } from "../../../../../src/model/users";
import { Item, ItemModel } from "../../../../../src/model/items";
import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { Member } from "../../../../../src/model/members";

describe("# unsetApprovalTaskOnly", () => {
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
    item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
  });

  it("should throw when `approvalType` is not PAGE", async () => {
    await expect(item.unsetApprovalTaskOnly()).to.eventually.rejected;
  });

  it("should not throw", async () => {
    await item.setApprovalPage("Sample Instruction");
    await item.unsetApprovalTaskOnly();
  });

  it("should modify the correct values", () => {
    expect(item.approval?.taskOnly).to.be.equal(false);
  });

  after(async () => {
    await Item.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
