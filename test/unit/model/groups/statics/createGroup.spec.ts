import {expect} from 'chai';
import {GroupModel, Group} from '../../../../../src/model/groups';
import {User} from '../../../../../src/model/users';

describe('# createGroup', () => {
  const testPayload: any = {
    name: 'Sample Group',
    description: 'Group description.',
  };
  let group: GroupModel;

  before(async () => {
    const user = await User.createUser({
      name: 'Sample name',
      email: 'sample@sample.com',
      password: 'sample-password',
    });
    testPayload.createdBy = user._id.toString();
  });

  it('should no throw error.', async () => {
    group = await Group.createGroup(testPayload);
  });

  it('should assign the correct values.', () => {
    const groupObj = group.toObject();
    expect(groupObj.name).to.be.equal(testPayload.name);
    expect(groupObj.description).to.be.equal(testPayload.description);
    expect(groupObj.createdBy.toString()).to.be.equal(testPayload.createdBy);
  });

  it('should save new data in the database.', async () => {
    const groupDB = await Group.findOne({}).exec();
    expect(groupDB?.toObject()).to.be.eql(group.toObject());
  });

  after(async () => {
    await Group.deleteMany({});
    await User.deleteMany({});
  });
});
