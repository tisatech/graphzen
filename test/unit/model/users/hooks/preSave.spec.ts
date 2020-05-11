import bcrypt from 'bcrypt';
import {expect} from 'chai';
import {UserModel, User} from '../../../../../src/model/users';

describe('# Presave', () => {
  const testPayload = {
    name: 'sample',
    email: 'sample@sample.com',
    password: 'password',
  };
  let user: UserModel;
  before(async () => {
    user = new User();
    user.name = testPayload.name;
    user.email = testPayload.email;
    user.password = testPayload.password;
    user = await user.save();
  });
  it('should change the password', () => {
    expect(user.password).to.be.not.equal(testPayload.password);
  });
  it('should encrypt the password properly.', (done) => {
    bcrypt.compare(testPayload.password, user.password, (err, isSame) => {
      try {
        if (err) throw err;
        expect(isSame).to.be.true;
        done();
      } catch (err) {
        done(err);
      }
    });
  });
});
