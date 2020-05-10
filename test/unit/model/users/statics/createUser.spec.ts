import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";

describe("# createUser", () => {
  let user: UserModel;
  const testPayload = {
    name: "X Æ A-12",
    email: "email@email.com",
    password: "S@mpl3 P@ssW0rD",
  };
  it("should create a new User.", async () => {
    user = await User.createUser(testPayload);
    expect(user).to.exist;
    expect(user).to.be.instanceOf(User);
  });
  it("should assign the right payload with password encrypted.", () => {
    expect(user.name).to.be.equal(testPayload.name);
    expect(user.email).to.be.equal(testPayload.email);
    expect(user.password).to.be.not.equal(testPayload.password);
  });
  it("should be existing in the database", async () => {
    const userFromDB = await User.findById(user._id).exec();
    expect(userFromDB?.toObject()).to.be.eql(user.toObject());
  });
  after(async () => {
    await User.deleteMany({});
  });
});
