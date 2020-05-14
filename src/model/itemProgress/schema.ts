import { Schema } from "mongoose";
import { MemberModel } from "../members";
import { ItemModel } from "../items";
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

export const ItemProgressSchema = new Schema({
  member: { type: Schema.Types.ObjectId, ref: "Member" },
  parent: { type: Schema.Types.ObjectId, ref: "RequirementsProgress" },
  definition: { type: Schema.Types.ObjectId, ref: "Item" },
  status: { type: String, enum: statusTypes },
});

interface BaseSchema {
  /** Status of the item. */
  status: keyof StatusType;
}

export interface ItemProgressSchema extends BaseSchema {
  /** The member ID assigned to this item. */
  member: string;
  /** The requirement ID parent for this item. */
  parent: string;
  /** The item definition ID for this item. */
  definition: string;
}

export interface ItemProgressSchemaPopulated extends BaseSchema {
  /** The member model assigned to this item. */
  member: MemberModel;
  /** The requirement model parent for this item. */
  parent: RequirementProgressModel;
  /** The item definition model for this item. */
  definition: ItemModel;
}
