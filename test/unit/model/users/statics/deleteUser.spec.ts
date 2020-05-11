import {expect} from 'chai';
import {User} from '../../../../../src/model/users';

describe('# deleteUser', () => {
  let _id = '';
  before(async () => {
    const user = new User();
    await user.save();
    _id = user._id.toString();
  });

  it('should not throw.', async () => {
    await User.deleteUser(_id);
  });
  it('should remove document from the database.', async () => {
    const user = await User.findById(_id);
    expect(user).to.not.exist;
  });
  after(async () => {
    await User.deleteMany({});
  });
});
