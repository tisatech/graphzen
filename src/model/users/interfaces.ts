import { UserSchema, UserSchemaPopulated } from "./schema";
import { UserStatics } from "./statics";
import { Document, Model } from "mongoose";

export interface UserModel extends UserSchema, Document {}
export interface UserModelPopulated extends UserSchemaPopulated, Document {}
export interface UserEntity extends UserStatics, Model<UserModel> {}
