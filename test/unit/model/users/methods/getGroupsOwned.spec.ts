import {expect} from 'chai';
import {User, UserModel} from '../../../../../src/model/users';
import {GroupModel, Group} from '../../../../../src/model/groups';

describe('# getGroupsOwned', () => {
  let user: UserModel;
  let group: GroupModel;
  const testPayload = {
    name: 'Sample Group',
    description: 'Sample Description',
  };

  before(async () => {
    user = await User.createUser({
      name: 'sample',
      email: 'sample',
      password: 'sample',
    });
    group = await user.createGroup(testPayload);
  });

  it('should return the correct group', async () => {
    const groups = await user.getGroupsOwned();
    expect(groups.length).to.be.equal(1);
    expect(groups[0].toObject()).to.be.eql(group.toObject());
  });

  after(async () => {
    await User.deleteMany({});
    await Group.deleteMany({});
  });
});
