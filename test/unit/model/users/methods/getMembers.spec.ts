import {expect} from 'chai';
import {User, UserModel} from '../../../../../src/model/users';
import {Member, MemberModel} from '../../../../../src/model/members';
import {GroupModel, Group} from '../../../../../src/model/groups';

describe('# getMember', () => {
  let user: UserModel;
  let member: MemberModel;
  let group: GroupModel;

  before(async () => {
    user = await User.createUser({
      name: 'sample name',
      email: 'sample email',
      password: 'sample password',
    });

    group = await user.createGroup({
      name: 'sample group name',
      description: 'sample description',
    });

    // member that is correct
    member = new Member();
    member.scope_group = group._id.toString();
    member.isShadow = false;
    member.isPublished = false;
    member.user = user._id.toString();
    member.groups = [
      {
        group: group._id.toString(),
        nickname: 'sample nickname',
        customID: 'sample ID',
      },
    ];
    await member.save();

    // member that is not correct
    const uselessMember = new Member();
    uselessMember.scope_group = group._id.toString();
    uselessMember.isShadow = true;
    uselessMember.isPublished = false;
    uselessMember.groups = [
      {
        group: group._id.toString(),
        nickname: 'sample useless nickname',
        customID: 'sample useless ID',
      },
    ];
    await uselessMember.save();
  });

  it('should get the correct members', async () => {
    const members = await user.getMembers();
    expect(members.length).to.be.equal(1);
    expect(members[0].toObject()).to.be.eql(member.toObject());
  });

  after(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
    await Member.deleteMany({});
  });
});
