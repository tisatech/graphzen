import { Schema } from "mongoose";
import { MemberModel } from "../members";
import { ClearanceModel } from "../clearances";
import { RequirementProgressModel } from "../requirementProgress";

/** Interface for status types. */
export interface StatusType {
  /** Indicates that the member has active control in this item. */
  ACTIVE: never;
  /** Indicates that the member has no active control in this item. */
  PENDING: never;
  /** Indicates that the member is cleared. */
  CLEARED: never;
}
const statusTypes: (keyof StatusType)[] = ["ACTIVE", "PENDING", "CLEARED"];

export const ClearanceProgressSchema = new Schema({
  definition: { type: Schema.Types.ObjectId, ref: "Clearance" },
  member: { type: Schema.Types.ObjectId, ref: "Member" },
  status: { type: String, enum: statusTypes },
  done: [{ type: Schema.Types.ObjectId, ref: "RequirementProgress" }],
  requirements: [{ type: Schema.Types.ObjectId, ref: "RequirementProgress" }],
});

interface BaseSchema {
  /** Status of the clearance. */
  status: keyof StatusType;
}

export interface ClearanceProgressSchema extends BaseSchema {
  /** Clearance ID of the clearance definition.*/
  definition: string;
  /** Member ID of the member. */
  member: string;
  /** Requirement IDs of done requirements. */
  done: string[];
  /** Requirement IDs of the requirements assigned. */
  requirements: string[];
}

export interface ClearanceProgressSchemaPopulated extends BaseSchema {
  /** Clearance model of the clearance definition.*/
  definition: ClearanceModel;
  /** Member model of the member. */
  member: MemberModel;
  /** Requirement models of done requirements. */
  done: RequirementProgressModel[];
  /** Requirement models of the requirements assigned. */
  requirements: RequirementProgressModel[];
}
