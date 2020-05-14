import { Schema } from "mongoose";
import { MemberModel } from "../members";
import { ItemProgressModel } from "../itemProgress";
import { ClearanceProgressModel } from "../clearanceProgress";
import { RequirementModel } from "../requirements";
import { ItemProgressMethods } from "../itemProgress/methods";

/** Interface for status types. */
interface StatusType {
  /** Indicates that the member has active control in this item. */
  ACTIVE: never;
  /** Indicates that the member has no active control in this item. */
  PENDING: never;
  /** Indicates that the member is cleared. */
  CLEARED: never;
}
const statusTypes: (keyof StatusType)[] = ["ACTIVE", "PENDING", "CLEARED"];

export const RequirementProgressSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: "Member" },
  parent: { type: Schema.Types.ObjectId, ref: "ClearanceProgress" },
  definition: { type: Schema.Types.ObjectId, ref: "Requirement" },
  status: { type: String, enum: statusTypes },
  items: [{ type: Schema.Types.ObjectId, ref: "ItemProgress" }],
  done: [{ type: Schema.Types.ObjectId, ref: "ItemProgress" }],
});

interface BaseSchema {
  status: keyof StatusType;
}

export interface RequirementProgressSchema extends BaseSchema {
  /** Member ID of the asisgned members. */
  member: string;
  /** ID of the ClearanceProgress parent. */
  parent: string;
  /** ID of the requirement definition */
  definition: string;
  /** ItemProgress IDs of the items of the requirement. */
  items: string[];
  /* ItemProgress IDs of the items accomplished* */
  done: string[];
}

export interface RequirementProgressSchemaPopulated extends BaseSchema {
  /** Member ID of the asisgned members. */
  member: MemberModel;
  /** ID of the ClearanceProgress parent. */
  parent: ClearanceProgressModel;
  /** ID of the requirement definition */
  definition: RequirementModel;
  /** ItemProgress IDs of the items of the requirement. */
  items: ItemProgressModel[];
  /* ItemProgress IDs of the items accomplished* */
  done: ItemProgressMethods[];
}
