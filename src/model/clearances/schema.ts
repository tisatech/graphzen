import { Schema } from "mongoose";
import { GroupModel } from "../groups";
import { ClearanceModel } from ".";
import { MemberModel } from "../members";
import { RequirementModel } from "../requirements";

export const ClearanceSchema = new Schema({
  name: String,
  description: String,
  isModifiedClearance: Boolean,
  createdBy: { type: Schema.Types.ObjectId, ref: "Member" },
  forkedFrom: { type: Schema.Types.ObjectId, ref: "Clearance" },
  scope_group: { type: Schema.Types.ObjectId, ref: "Group" },
  assignedMembers: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  assignedGroups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
  requirements: [{ type: Schema.Types.ObjectId, ref: "Requirement" }],
});

/**
 * Independent clearance model schema.
 */
interface BaseSchema {
  /** Name of the clearance. */
  name: string;

  /** True if the clearance is modified without propagating the changes. */
  isModifiedClearance: boolean;

  /** Description of the clearance. */
  description: string;
}

/**
 * Independent clearance model schema with populate-able fields not populated.
 */
export interface ClearanceSchema extends BaseSchema {
  /** ID of the member who created the clearance. */
  createdBy: string;
  /** ID of the clearance where this clearance is forked from. */
  forkedFrom: string;
  /** ID of the group where the clearance belongs. */
  scope_group: string;
  /** ID of the members assigned to this clearance. */
  assignedMembers: string[];
  /** ID of the groups assigned to this clearance */
  assignedGroups: string[];
  /** ID of the requirements needed for this clearance. */
  requirements: string[];
}

/**
 * Independent clearance model schema with populate-able fields populated.
 */
export interface ClearanceSchemaPopulated extends BaseSchema {
  /** Model of the member who created the clearance. */
  createdBy: MemberModel;
  /** Model of the clearance where this clearance is forked from. */
  forkedFrom: ClearanceModel;
  /** Model of the group where the clearance belongs. */
  scope_group: GroupModel;
  /** Model of the members assigned to this clearance. */
  assignedMembers: MemberModel[];
  /** Model of the groups assigned to this clearance */
  assignedGroups: GroupModel[];
  /** Model of the requirements needed for this clearance. */
  requirements: RequirementModel[];
}
