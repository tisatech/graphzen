import bcrypt from "bcrypt";
import { UserSchema } from "./schema";
import { Document, Model } from "mongoose";
import { UserStatics } from "./statics";
import { Group, GroupModel } from "../groups";
import { INewGroupPayload } from "../groups/statics";
import { MemberModel, Member } from "../members";

interface INewGroupPayloadModified {
  name: INewGroupPayload["name"];
  description: INewGroupPayload["description"];
}

export interface UserMethods {
  createGroup: (payload: INewGroupPayloadModified) => Promise<GroupModel>;
  getMembers: () => Promise<MemberModel[]>;
  getGroups: () => Promise<string[]>;
  getGroupsOwned: () => Promise<GroupModel[]>;
  verifyPassword: (password: string) => Promise<boolean>;
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
    for (let _id of groups) dict[_id] = _id;
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
  const groups = await Group.find({ _id: { $in: this.owned_groups } }).exec();
  return groups;
};

/**
 * Create a new group under this user
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @returns The newly created group.
 */
UserSchema.methods.createGroup = async function createGroup(
  this: UserModel,
  payload: INewGroupPayloadModified
) {
  const group = await Group.createGroup({
    ...payload,
    createdBy: this._id,
  });
  this.owned_groups.push(group._id);
  await this.save();
  return group;
};

/**
 * Returns true if the password is correct.
 * @param password - The attempted password.
 * @returns true if the password is correct.
 */
UserSchema.methods.verifyPassword = function verifyPassword(
  this: UserModel,
  password: string
) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, same) => {
      if (err) return reject(err);
      resolve(same);
    });
  });
};
