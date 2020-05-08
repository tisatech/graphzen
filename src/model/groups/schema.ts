import { Schema, Document } from "mongoose";
import { MemberModel } from "../members";
import { ClearanceModel } from "../clearances";
import { UserModel } from "../users/index";

export const GroupSchema = new Schema({
  name: String,
  description: String,
  isRoot: { type: Boolean, default: true },
  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  clearances: [{ type: Schema.Types.ObjectId, ref: "Clearance" }],
  subgroups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
});

interface BaseSchema {
  name: string;
  description: string;
  isRoot: boolean;
}

export interface GroupSchema extends BaseSchema {
  members: string[];
  clearances: string[];
  subgroups: string[];
  createdBy: string;

  parentUser: string;
  parentGroup: string;
}

interface GroupModel extends GroupSchema, Document {}
export interface GroupSchemaPopulated extends BaseSchema {
  members: MemberModel[];
  clearances: ClearanceModel[];
  subgroups: GroupModel[];
  createdBy: UserModel;

  parentUser: UserModel;
  parentGroup: GroupModel;
}
