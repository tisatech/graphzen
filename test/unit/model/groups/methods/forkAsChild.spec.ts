import {expect} from 'chai';
import {GroupModel, Group} from '../../../../../src/model/groups';
import {User, UserModel} from '../../../../../src/model/users';
import {Member, MemberModel} from '../../../../../src/model/members';

describe('# forkAsChild', () => {
  let group: GroupModel;
  let user: UserModel;
  let member: MemberModel;
  before(async () => {
    user = await User.createUser({
      name: 'Sample User',
      email: 'email@email.com',
      password: 'password',
    });

    group = await Group.createGroup({
      name: 'Sample Group',
      description: 'Sample group',
      createdBy: user._id.toString(),
    });

    member = await group.addMember(user);
  });

  let childGroup: GroupModel;
  it('should not throw', async () => {
    childGroup = await group.forkAsChild(user._id.toString());
  });

  it('should update subgroups of parent group', async () => {
    const groupDB = await Group.getGroup(group._id.toString());
    expect(groupDB.subgroups.length).to.be.equal(1);
    expect(groupDB.subgroups[0].toString()).to.be.equal(
        childGroup._id.toString(),
    );
  });
  it('should have the right details', () => {
    expect(childGroup.name).to.be.equal('Sample Group - Copy');
    expect(childGroup.description).to.be.equal('Sample group');
    expect(childGroup.createdBy.toString()).to.be.equal(user._id.toString());
    expect(childGroup.parentGroup.toString()).to.be.equal(group._id.toString());
    expect(childGroup.isRoot).to.be.false;
  });
  it('should copy the members', () => {
    expect(childGroup.members).to.be.eql(group.members);
  });
  it('should update the members groups', async () => {
    const memberDB = await Member.findById(member._id.toString());
    expect(memberDB?.groups.map((x) => x.group.toString())).to.be.eql([
      group._id.toString(),
      childGroup._id.toString(),
    ]);
  });

  after(async () => {
    await Member.deleteMany({});
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
