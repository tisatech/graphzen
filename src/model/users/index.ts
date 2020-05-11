import { model, Model } from "mongoose";
import { UserSchema } from "./schema";
import { UserModel, UserEntity } from "./interfaces";
import { UserStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

/**
 * The mongoose model for the user.
 * @category User
 */
export const User: UserEntity = model<
  UserModel,
  Model<UserModel> & UserStatics
>("User", UserSchema);

export { UserModel } from "./interfaces";
