import { Schema } from "mongoose";
import { ItemModel } from "../items/";
import { MemberModel } from "../members";
import { ClearanceModel } from "../clearances";

export const RequirementSchema = new Schema({
  name: String,
  items: [{ type: Schema.Types.ObjectId, ref: "Item" }],
  clearance: { type: Schema.Types.ObjectId, ref: "Clearance" },
  assignedMember: { type: Schema.Types.ObjectId, ref: "Member" },
});

interface BaseSchema {
  /** Name of the requirement */
  name: string;
}

export interface RequirementSchema extends BaseSchema {
  /** Item IDs of the requirements. */
  items: string[];
  /** Clearance ID where this requirement is defined. */
  clearance: string;
  /** Member ID where this requirement is defined. */
  assignedMember: string;
}

export interface RequirementSchemaPopulated extends BaseSchema {
  /** Item models of the requirements. */
  items: ItemModel[];
  /** Clearance model where this requirement is defined. */
  clearance: ClearanceModel[];
  /** Member model where this requirement is defined. */
  assignedMember: MemberModel[];
}
