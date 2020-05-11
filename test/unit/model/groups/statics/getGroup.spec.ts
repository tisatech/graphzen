import {expect} from 'chai';
import {Group, GroupModel} from '../../../../../src/model/groups';
import {User} from '../../../../../src/model/users';

describe('# getGroup', () => {
  let group: GroupModel;

  before(async () => {
    const testPayload: any = {
      name: 'Sample Group',
      description: 'Group description.',
    };
    const user = await User.createUser({
      name: 'Sample name',
      email: 'sample@sample.com',
      password: 'sample-password',
    });
    testPayload.createdBy = user._id.toString();

    // Create 2 dummy groups.
    for (let i = 0; i < 3; i++) {
      const tempGroup = new Group();
      tempGroup.name = `${testPayload.name} - ${i}`;
      tempGroup.description = `${testPayload.description} - ${i}`;
      tempGroup.createdBy = user._id.toString();
      await tempGroup.save();
      if (i == 0) group = tempGroup;
    }
  });

  it('should return the correct group', async () => {
    const groupDB = await Group.getGroup(group._id.toString());
    expect(groupDB.toObject()).to.be.eql(group.toObject());
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
