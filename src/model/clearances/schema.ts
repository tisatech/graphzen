import { Schema } from "mongoose";
import { UserModel } from "../users";
import { GroupModel } from "../groups";
import { ClearanceModel } from ".";
import { MemberModel } from "../members";
import { RequirementModel } from "../requirements";

export const ClearanceSchema = new Schema({
  name: String,
  description: String,
  isModified: Boolean,
  createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  forkedFrom: { type: Schema.Types.ObjectId, ref: "Group" },
  scope_group: { type: Schema.Types.ObjectId, ref: "Group" },
  assignedMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  assignedGroups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  requirements: [{ type: Schema.Types.ObjectId, ref: "Requirement" }],
});

/**
 * Independent clearance model schema.
 */
interface BaseSchema {
  name: string;
  isModified: boolean;
  description: string;
}

/**
 * Independent clearance model schema with populate-able fields not populated.
 */
export interface ClearanceSchema extends BaseSchema {
  createdBy: string;
  forkedFrom: string;
  scope_group: string;
  assignedMembers: string[];
  assignedGroups: string[];
  requirements: string[];
}

/**
 * Independent clearance model schema with populate-able fields populated.
 */
export interface ClearanceSchemaPopulated extends BaseSchema {
  createdBy: UserModel;
  forkedFrom: ClearanceModel;
  scope_group: GroupModel;
  assignedMembers: MemberModel[];
  assignedGroups: GroupModel[];
  requirements: RequirementModel[];
}
