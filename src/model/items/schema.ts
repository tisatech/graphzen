import { Schema } from "mongoose";
import { MemberModel } from "../members";
import { User } from "../users";
import { RequirementModel } from "../requirements";
import { ClearanceModel } from "../clearances";

/** Interface for approval enumerations. */
interface ApprovalTypes {
  /** Approval should come from a members. */
  MEMBER: never;

  /** Approval should come from the one who created the requiement. */
  STAFF: never;

  /** Approval comes from a page button. */
  PAGE: never;

  /** Approval comes from accomplishing another clearance within the group tree. */
  CLEARANCE: never;

  /** Approval comes from a requirement within this clearance. */
  REQUIREMENT: never;
}

/** Interface for Item privacy. */
interface PrivacyTypes {
  /** Links will only be accesed if the user is logged in. */
  PRIVATE: never;
  /** Links can be accessed anywhere. */
  UNLISTED: never;
}

/** Array of approval types. */
const approvalTypes: (keyof ApprovalTypes)[] = [
  "MEMBER",
  "STAFF",
  "PAGE",
  "CLEARANCE",
  "REQUIREMENT",
];
const privacyTypes: (keyof PrivacyTypes)[] = ["PRIVATE", "UNLISTED"];

export const ItemSchema = new Schema({
  name: String,
  description: String,
  hasDeadline: Boolean,
  deadline: Date,
  approvalType: { type: String, enum: approvalTypes },
  approval: {
    instruction: String,
    privacy: { type: String, enum: privacyTypes },
    taskOnly: Boolean,
  },

  members: [{ type: Schema.Types.ObjectId, ref: "Member" }],
  clearancens: [{ type: Schema.Types.ObjectId, ref: "Clearance" }],
  requiements: [{ type: Schema.Types.ObjectId, ref: "Requirement" }],

  assignedMember: { type: Schema.Types.ObjectId, ref: "Member" },
});

interface BaseSchema {
  /** Name of the Item */
  name: string;
  /** Description of the Item */
  description: string;

  /** Whether the item has a specified deadline. */
  hasDeadline: boolean;

  /** The deadline */
  deadline?: Date;

  /** Type of approval item. */
  approvalType: keyof ApprovalTypes;

  /** Additional approval details. */
  approval?: {
    /** Instructions for the approval. */
    instruction: string;

    /** Type of approval privacy. */
    privacy?: keyof PrivacyTypes;

    /** True if only the task will be shown. */
    taskOnly: boolean;
  };
}

export interface ItemSchema extends BaseSchema {
  /** The member IDs that is authorized to approve the item. */
  members: string[];
  /** The requirement IDs that is needed to approve the item. */
  requirements: string[];

  /** The requirement IDs that is needed to approve the item. */
  clearances: string[];

  /** The member ID of the one who created the item. */
  assignedMember: string;
}

export interface ItemSchemaPopulated extends BaseSchema {
  /** The member models that is authorized to approve the item. */
  members: MemberModel[];

  /** The requirement models that is needed to approve the item. */
  requirements: RequirementModel[];

  /** The clearance models that is needed to approve the item. */
  clearances: ClearanceModel[];

  /** The member model of the one who created the item. */
  assignedMember: MemberModel;
}
