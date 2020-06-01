import { User } from "../../../../../src/model/users";
import { Item, ItemModel } from "../../../../../src/model/items";
import { expect } from "chai";
import { Group } from "../../../../../src/model/groups";
import { Member, MemberModel } from "../../../../../src/model/members";

describe("# setApprovalMembers", () => {
  let item: ItemModel;
  const members: MemberModel[] = [];

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

    members.push(await group.addMember());
    members.push(await group.addMember());

    item = await Item.createItem({
      name: `Sample Item`,
      description: `Description`,
      assignedMember: member._id.toString(),
    });
  });

  it("should not throw", async () => {
    await item.setApprovalMembers(members, "Sample Instruction");
  });

  it("should modify the correct values", () => {
    const itemObj = item.toObject();
    expect(itemObj.approvalType).to.be.equal("MEMBER");
    expect(itemObj.approval).to.be.eql({
      instruction: "Sample Instruction",
      taskOnly: false,
    });
    expect(itemObj.members.length).to.be.equal(2);
    expect(itemObj.members[0].toString()).to.be.equal(
      members[0]._id.toString()
    );
    expect(itemObj.members[1].toString()).to.be.equal(
      members[1]._id.toString()
    );
    expect(itemObj.clearances.length).to.be.equal(0);
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
