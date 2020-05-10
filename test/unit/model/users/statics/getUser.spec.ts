import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";

describe("# getUser", () => {
  let user: UserModel;
  const testPayload = {
    name: "X Æ A-12",
    email: "email@email.com",
    password: "S@mpl3 P@ssW0rD",
  };
  before(async () => {
    user = new User();
    user.name = testPayload.name;
    user.email = testPayload.email;
    user.password = testPayload.password;
    await user.save();
  });

  it("should return the correct document.", async () => {
    const userFromDatabase = await User.findById(user._id);
    expect(userFromDatabase).to.exist;
    expect(user.toObject()).to.be.eql(userFromDatabase?.toObject());
  });
  after(async () => {
    await User.deleteMany({});
  });
});
