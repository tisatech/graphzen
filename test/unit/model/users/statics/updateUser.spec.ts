import { expect } from "chai";
import { User, UserModel } from "../../../../../src/model/users";

describe("# updateUser", () => {
  let _id: string = "";
  let user: UserModel;
  const updatePayload = {
    name: "X Æ A-12",
    email: "email@email.com",
    password: "S@mpl3-P@ssW0rD",
  };
  before(async () => {
    user = new User();
    user.name = "Not updated name.";
    user.email = "not_updated_email@email.com";
    user.password = "Not updated password.";
    await user.save();
    _id = user._id;
  });

  it("should not throw error.", async () => {
    await User.updateUser(_id, updatePayload);
  });

  it("should update the document in the database, with newly encrypted password.", async () => {
    const userFromDB = await User.findById(_id).exec();
    expect(userFromDB?.name).to.be.equal(updatePayload.name);
    expect(userFromDB?.email).to.be.equal(updatePayload.email);
    expect(userFromDB?.password).to.be.not.equal(updatePayload.password);
  });
  after(async () => {
    await User.deleteMany({});
  });
});
