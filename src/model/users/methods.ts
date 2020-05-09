import { UserSchema } from "./schema";
import { Document, Model, model } from "mongoose";
import { UserStatics } from "./statics";
import { Group, GroupModel } from "../groups";
import { INewGroupPayload } from "../groups/statics";
import { MemberModel, Member } from "../members";

export interface UserMethods {
  getMembers: () => Promise<MemberModel[]>;
  getGroups: () => Promise<string[]>;
  getGroupsOwned: () => Promise<GroupModel[]>;
  createGroup: () => Promise<GroupModel>;
}

interface UserModel extends UserSchema, Document, UserMethods {}
interface UserEntity extends UserStatics, Model<UserModel> {}

/**
 * Get groups in which the current user belongs.
 * @returns The groups
 */
UserSchema.methods.getGroups = async function getGroups(this: UserModel) {
  const memberships = await this.getMembers();
  const dict: { [key: string]: string } = {};
  memberships.forEach((member) => {
    const groups = member.groups.map((x) => x.group.toString());
    for (let _id in groups) dict[_id] = _id;
  });
  return Object.keys(dict);
};

/**
 * Get members in which the current user belongs.
 * @returns The members
 */
UserSchema.methods.getMembers = async function getMembers(this: UserModel) {
  const members = await Member.find({ user: this._id.toString() }).exec();
  return members;
};

/**
 * Get groups that are owned by the user.
 * @returns The groups
 */
UserSchema.methods.getGroupsOwned = async function getGroups(this: UserModel) {
  const groups = await Group.find({ $in: this.owned_groups }).exec();
  return groups;
};

/**
 * Create a new group under this user
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @param payload.createdBy - The user who created the group.
 * @param payload.parentGroup - The group in which this group is created.
 * @returns The newly created group.
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
