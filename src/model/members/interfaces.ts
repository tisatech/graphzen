import { MemberSchema, MemberSchemaPopulated } from "./schema";
import { MemberStatics } from "./statics";
import { Document, Model } from "mongoose";
import { MemberMethods } from "./methods";

export interface MemberModel extends MemberSchema, MemberMethods, Document {}
export interface MemberModelPopulated extends MemberSchemaPopulated, Document {}
export interface MemberEntity extends Model<MemberModel>, MemberStatics {}
