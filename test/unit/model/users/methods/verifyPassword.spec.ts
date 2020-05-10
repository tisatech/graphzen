import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";

describe("# verifyPassword", () => {
  let user: UserModel;
  const testPayload = {
    name: "X Æ A-12",
    email: "email@email.com",
    password: "S@mpl3 P@ssW0rD",
  };

  before(async () => {
    user = await User.createUser(testPayload);
  });

  it("should return true when the password is correct", async () => {
    const isSame = await user.verifyPassword(testPayload.password);
    expect(isSame).to.be.true;
  });

  it("should return false when the password is incorrect", async () => {
    const isSame = await user.verifyPassword("wRoNgPaSsWoRd");
    expect(isSame).to.be.false;
  });

  after(async () => {
    await User.deleteMany({});
  });
});
