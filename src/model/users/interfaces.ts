import { UserSchema, UserSchemaPopulated } from "./schema";
import { UserStatics } from "./statics";
import { Document, Model } from "mongoose";
import { UserMethods } from "./methods";

export interface UserModel extends UserSchema, Document, UserMethods {}
export interface UserModelPopulated extends UserSchemaPopulated, Document {}
export interface UserEntity extends UserStatics, Model<UserModel> {}
