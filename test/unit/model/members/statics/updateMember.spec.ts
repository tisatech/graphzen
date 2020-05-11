import {expect} from 'chai';
import {Group, GroupModel} from '../../../../../src/model/groups';
import {User} from '../../../../../src/model/users';
import {MemberModel, Member} from '../../../../../src/model/members';

describe('# updateMember', () => {
  let _id: string;
  let group: GroupModel;
  let member: MemberModel;
  const updatePayload = {
    nickname: 'New nickname',
    customID: 'New ID',
  };

  before(async () => {
    const user = await User.createUser({
      name: 'sample',
      email: 'email@email.com',
      password: 'password',
    });
    group = await user.createGroup({
      name: 'sample group',
      description: 'sample group',
    });
    member = await group.addMember(user);
    _id = member._id.toString();
  });

  it('should throw no error.', async () => {
    await Member.updateMember(_id, {
      ...updatePayload,
      group: group._id.toString(),
    });
  });

  it('should update the correct values in the database.', async () => {
    const memberDB = await Member.findById(_id).exec();
    expect(memberDB?.groups.length).to.be.equal(1);
    expect(memberDB?.groups[0].nickname).to.be.equal(updatePayload.nickname);
    expect(memberDB?.groups[0].customID).to.be.equal(updatePayload.customID);
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
    await Member.deleteMany({});
  });
});
