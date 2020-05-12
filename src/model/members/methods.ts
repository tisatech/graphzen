import { ClearanceModel } from "../clearances";
import { MemberSchema } from "./schema";
import { MemberModel } from "./interfaces";
import { MemberNotShadowError, MemberShadowError } from "../../lib/errors";

export interface MemberMethods {
  assignUser(user: string): Promise<void>;
  publish(): Promise<void>;
  unpublish(): Promise<void>;
  unassignUser(): Promise<void>;
  getClearanceOwned(): Promise<ClearanceModel[]>;
  getClearance(): Promise<ClearanceModel[]>;
  // getApprovals(): Promise<RequirementItemDefinition[]>
}

/**
 * Assign user to the database.
 * @param user - User _id to be assigned.
 * @throws MemberShadowError
 */
async function assignUser(this: MemberModel, _id: string) {
  if (!this.isShadow) throw new MemberNotShadowError("Cannot assign user.");
  this.user = _id;
  this.isShadow = false;
  this.isPublished = false;
  await this.save();
}
MemberSchema.methods.assignUser = assignUser;

/**
 * Unassign user to the database.
 * @throws MemberNotShadowError
 */
async function unassignUser(this: MemberModel) {
  if (this.isShadow) throw new MemberShadowError("Cannot unassign user.");
  this.user = undefined;
  this.isShadow = true;
  this.isPublished = false;
  await this.save();
}
MemberSchema.methods.unassignUser = unassignUser;

/**
 * Publish the shadow member url.
 * @throws MemberNotShadowError
 */
async function publish(this: MemberModel) {
  if (!this.isShadow) throw new MemberNotShadowError("Cannot publish member.");
  this.isPublished = true;
  await this.save();
}
MemberSchema.methods.publish = publish;

/**
 * Unpublish the shadow member url.
 * @throws MemberNotShadowError
 */
async function unpublish(this: MemberModel) {
  if (!this.isShadow) {
    throw new MemberNotShadowError("Cannot unpublish member.");
  }
  this.isPublished = false;
  await this.save();
}
MemberSchema.methods.unpublish = unpublish;
