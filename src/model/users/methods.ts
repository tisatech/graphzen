import { UserSchema } from "./schema";
import { Document, Model, model } from "mongoose";
import { UserStatics } from "./statics";
import { Group, GroupModel } from "../groups";
import { User } from ".";
import { INewGroupPayload } from "../groups/statics";

export interface UserMethods {
  getGroups: () => Promise<GroupModel[]>;
  getGroupsOwned: () => Promise<GroupModel[]>;
  createGroup: () => Promise<GroupModel>;
}

interface UserModel extends UserSchema, Document, UserMethods {}
interface UserEntity extends UserStatics, Model<UserModel> {}

/**
 * Get groups in which the current user belongs.
 * @returns Promise<Group[]>
 */
UserSchema.methods.getGroups = async function getGroups(this: UserModel) {
  // code soon
};

/**
 * Get groups that are owned by the user.
 * @returns Promise<Group[]>
 */
UserSchema.methods.getGroupsOwned = async function getGroups(this: UserModel) {
  const groups = await Group.find({ $in: this.owned_groups }).exec();
  return groups;
};

/**
 * Create a new Group under this user
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @param payload.createdBy - The user who created the group.
 * @param payload.parentGroup - The group in which this group is created.
 * @returns Promise<GroupModel>
 */
UserSchema.methods.createGroup = async function createGroup(
  this: UserModel,
  payload: INewGroupPayload
) {
  const group = await Group.createGroup(payload);
  this.owned_groups.push(group._id);
  await this.save();
  return group;
};
