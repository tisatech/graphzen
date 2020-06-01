import { ClearanceModel } from "../clearances";
import { MemberModel } from "../members";
import { RequirementModel } from "../requirements";
import { ItemModel } from "./interfaces";
import { ItemSchema } from "./schema";
import { ItemTypeNotPageError } from "../../lib/errors";

export interface ItemMethods {
  // Approvals
  setApprovalStaff(): Promise<void>;
  setApprovalClearance(clearances: ClearanceModel[]): Promise<void>;
  setApprovalRequirement(requirements: RequirementModel[]): Promise<void>;
  setApprovalPage(instruction: string): Promise<void>;
  setApprovalMembers(
    members: MemberModel[],
    instruction: string
  ): Promise<void>;

  // Approval Privacy
  setApprovalAsPrivate(): Promise<void>;
  setApprovalAsUnlisted(): Promise<void>;
  setApprovalTaskOnly(): Promise<void>;
  unsetApprovalTaskOnly(): Promise<void>;

  // Deadlines
  setDeadline(date: Date): Promise<void>;
  removeDeadline(): Promise<void>;
}

/**
 * Set the approval type of the item to staff.
 */
const setApprovalStaff: ItemMethods["setApprovalStaff"] = async function (
  this: ItemModel
) {
  this.approvalType = "STAFF";
  this.approval = undefined;
  delete this.approval;
  this.members = [this.assignedMember];
  this.clearances = [];
  this.requirements = [];
  await this.save();
};
ItemSchema.methods.setApprovalStaff = setApprovalStaff;

/**
 * Set the approval type of the item to clearance.
 * @param clearances - The clearances needed for approval.
 */
const setApprovalClearance: ItemMethods["setApprovalClearance"] = async function (
  this: ItemModel,
  clearances: ClearanceModel[]
) {
  this.approvalType = "CLEARANCE";
  this.approval = undefined;
  delete this.approval;
  this.members = [];
  this.clearances = clearances.map((x) => x._id.toString());
  this.requirements = [];
  await this.save();
};
ItemSchema.methods.setApprovalClearance = setApprovalClearance;

/**
 * Set the approval type of the item to a requirement.
 * @param requirements - The requirements needed for approval.
 */
const setApprovalRequirement: ItemMethods["setApprovalRequirement"] = async function (
  this: ItemModel,
  requirements: RequirementModel[]
) {
  this.approvalType = "REQUIREMENT";
  this.approval = undefined;
  delete this.approval;
  this.members = [];
  this.clearances = [];
  this.requirements = requirements.map((x) => x._id.toString());
  await this.save();
};
ItemSchema.methods.setApprovalRequirement = setApprovalRequirement;

/**
 * Set the approval type of the item to members.
 * @param members - The members needed for approval.
 * @param instruction - The instruction for the members.
 */
const setApprovalMembers: ItemMethods["setApprovalMembers"] = async function (
  this: ItemModel,
  members: MemberModel[],
  instruction: string
) {
  this.approvalType = "MEMBER";
  this.approval = {
    instruction,
    taskOnly: false,
  };
  this.members = members.map((x) => x._id.toString());
  this.clearances = [];
  this.requirements = [];
  await this.save();
};
ItemSchema.methods.setApprovalMembers = setApprovalMembers;

/**
 * Set approval type of to page.
 * @param instruction - The instruction displayed on the page.
 */
const setApprovalPage: ItemMethods["setApprovalPage"] = async function (
  this: ItemModel,
  instruction: string
) {
  this.approvalType = "PAGE";
  this.approval = {
    instruction,
    privacy: "UNLISTED",
    taskOnly: false,
  };
  this.members = [];
  this.requirements = [];
  this.clearances = [];
  await this.save();
};
ItemSchema.methods.setApprovalPage = setApprovalPage;

/**
 * Set the approval as private.
 * @throws ItemTypeNotPageError
 */
const setApprovalAsPrivate: ItemMethods["setApprovalAsPrivate"] = async function (
  this: ItemModel
) {
  if (this.approvalType != "PAGE")
    throw new ItemTypeNotPageError("Can not set approval as private.");
  if (!this.approval)
    throw new ItemTypeNotPageError(
      "Can not set approval to private. Document may be corrupted."
    );

  this.approval.privacy = "PRIVATE";
  await this.save();
};
ItemSchema.methods.setApprovalAsPrivate = setApprovalAsPrivate;

/**
 * Set the approval as Unlisted
 * @throws ItemTypeNotPageError
 */
const setApprovalAsUnlisted: ItemMethods["setApprovalAsUnlisted"] = async function (
  this: ItemModel
) {
  if (this.approvalType != "PAGE")
    throw new ItemTypeNotPageError("Can not set approval to unlisted.");
  if (!this.approval)
    throw new ItemTypeNotPageError(
      "Can not set approval to unlisted. Document may be corrupted."
    );

  this.approval.privacy = "UNLISTED";
  await this.save();
};
ItemSchema.methods.setApprovalAsUnlisted = setApprovalAsUnlisted;

/**
 * Set the approval visibility as task-only
 * @throws ItemTypeNotPageError
 */
const setApprovalTaskOnly: ItemMethods["setApprovalTaskOnly"] = async function (
  this: ItemModel
) {
  if (this.approvalType != "PAGE")
    throw new ItemTypeNotPageError(
      "Can not set approval visibility to task-only."
    );
  if (!this.approval)
    throw new ItemTypeNotPageError(
      "Can not set approval visibility to task-only. Document may be corrupted."
    );

  this.approval.taskOnly = true;
  await this.save();
};
ItemSchema.methods.setApprovalTaskOnly = setApprovalTaskOnly;

/**
 * Set the approval visibility as not task-only
 * @throws ItemTypeNotPageError
 */
const unsetApprovalTaskOnly: ItemMethods["unsetApprovalTaskOnly"] = async function (
  this: ItemModel
) {
  if (this.approvalType != "PAGE")
    throw new ItemTypeNotPageError(
      "Can not set approval visibility to task-only."
    );
  if (!this.approval)
    throw new ItemTypeNotPageError(
      "Can not set approval visibility to task-only. Document may be corrupted."
    );

  this.approval.taskOnly = false;
  await this.save();
};
ItemSchema.methods.unsetApprovalTaskOnly = unsetApprovalTaskOnly;

/**
 * Set the deadline of the requirement.
 * @param date - The deadline.
 */
const setDeadline: ItemMethods["setDeadline"] = async function (
  this: ItemModel,
  date: Date
) {
  this.hasDeadline = true;
  this.deadline = date;
  await this.save();
};
ItemSchema.methods.setDeadline = setDeadline;

/**
 * Unset the deadline of the requirement.
 */
const removeDeadline: ItemMethods["removeDeadline"] = async function (
  this: ItemModel
) {
  this.hasDeadline = false;
  this.deadline = undefined;
  await this.save();
};
ItemSchema.methods.removeDeadline = removeDeadline;
