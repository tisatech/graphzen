import {expect} from 'chai';
import {Member, MemberModel} from '../../../../../src/model/members';
import {GroupModel, Group} from '../../../../../src/model/groups';
import {User} from '../../../../../src/model/users';

describe('# createMember', () => {
  const testPayload = {
    nickname: 'Sample nickname',
    customID: '12345678',
  };
  let group: GroupModel;
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
  });
  let member: MemberModel;

  it('should throw no error.', async () => {
    member = await Member.createMember({
      ...testPayload,
      scope_group: group._id.toString(),
    });
  });

  it('should assign the default values.', () => {
    const memberObj = member;
    expect(memberObj.user).to.not.exist;
    expect(memberObj.scope_group.toString()).to.be.equal(group._id.toString());
    expect(memberObj.isShadow).to.be.true;
    expect(memberObj.isPublished).to.be.false;
  });

  it('should save new data in the database.', async () => {
    const memberDB = await Member.findOne({}).exec();
    expect(memberDB?.toObject()).to.be.eql(member.toObject());
  });

  after(async () => {
    await Member.deleteMany({});
    await User.deleteMany({});
    await Group.deleteMany({});
  });
});
