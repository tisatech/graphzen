import { GroupSchema, GroupSchemaPopulated } from "./schema";
import { GroupStatics } from "./statics";
import { Document, Model } from "mongoose";
import { GroupMethods } from "./methods";

export interface GroupModel extends GroupSchema, GroupMethods, Document {}
export interface GroupModelPopulated extends GroupSchemaPopulated, Document {}
export interface GroupEntity extends Model<GroupModel>, GroupStatics {}
