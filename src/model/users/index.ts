import { model } from "mongoose";
import { UserSchema } from "./schema";
import { UserModel, UserEntity } from "./interfaces";
import "./hook";
import { UserStatics } from "./statics";

export const User: UserEntity = model<UserModel, UserModel & UserStatics>(
  "User",
  UserSchema
);
export { UserModel } from "./interfaces";
