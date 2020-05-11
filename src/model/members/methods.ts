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
MemberSchema.methods.assignUser = async function assignUser(
  this: MemberModel,
  _id: string
) {
  if (!this.isShadow) throw new MemberNotShadowError("Cannot assign user.");
  this.user = _id;
  this.isShadow = false;
  this.isPublished = false;
  await this.save();
};

/**
 * Unassign user to the database.
 * @throws MemberNotShadowError
 */
MemberSchema.methods.unassignUser = async function assignUser(
  this: MemberModel
) {
  if (this.isShadow) throw new MemberShadowError("Cannot unassign user.");
  this.user = undefined;
  this.isShadow = true;
  this.isPublished = false;
  await this.save();
};

/**
 * Publish the shadow member url.
 * @throws MemberNotShadowError
 */
MemberSchema.methods.publish = async function assignUser(this: MemberModel) {
  if (!this.isShadow) throw new MemberNotShadowError("Cannot publish member.");
  this.isPublished = true;
  await this.save();
};

/**
 * Unpublish the shadow member url.
 * @throws MemberNotShadowError
 */
MemberSchema.methods.unpublish = async function assignUser(this: MemberModel) {
  if (!this.isShadow) {
    throw new MemberNotShadowError("Cannot unpublish member.");
  }
  this.isPublished = false;
  await this.save();
};
