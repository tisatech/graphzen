import bcrypt from "bcrypt";
import { UserSchema } from "./schema";
import { Group, GroupModel } from "../groups";
import { NewGroupPayload } from "../groups/statics";
import { MemberModel, Member } from "../members";
import { UserModel } from ".";

/** @category Group */
interface NewGroupPayloadModified {
  /** The name of the new group. */
  name: NewGroupPayload["name"];
  /** The description of the new group. */
  description: NewGroupPayload["description"];
}

/**
 * Interface for User methods
 * @category User
 */
export interface UserMethods {
  createGroup: (payload: NewGroupPayloadModified) => Promise<GroupModel>;
  getMembers: () => Promise<MemberModel[]>;
  getGroups: () => Promise<string[]>;
  getGroupsOwned: () => Promise<GroupModel[]>;
  verifyPassword: (password: string) => Promise<boolean>;
}

/**
 * Get groups in which the current user belongs.
 * @return The group IDs
 * @category User > Methods
 */
async function getGroups(this: UserModel) {
  const memberships = await this.getMembers();
  const dict: { [key: string]: string } = {};
  memberships.forEach((member) => {
    const groups = member.groups.map((x) => x.group.toString());
    for (const _id of groups) dict[_id] = _id;
  });
  return Object.keys(dict);
}
UserSchema.methods.getGroups = getGroups;
/**
 * Get members in which the current user belongs.
 * @return The members
 * @category User > Methods
 */
async function getMembers(this: UserModel) {
  const members = await Member.find({ user: this._id.toString() }).exec();
  return members;
}
UserSchema.methods.getMembers = getMembers;
/**
 * Get groups that are owned by the user.
 * @return The groups
 * @category User > Methods
 */
async function getGroupsOwned(this: UserModel) {
  const groups = await Group.find({ _id: { $in: this.owned_groups } }).exec();
  return groups;
}
UserSchema.methods.getGroupsOwned = getGroupsOwned;
/**
 * Create a new group under this user
 * @return The newly created group.
 * @category User > Methods
 */
async function createGroup(this: UserModel, payload: NewGroupPayloadModified) {
  const group = await Group.createGroup({
    ...payload,
    createdBy: this._id,
  });
  this.owned_groups.push(group._id);
  await this.save();
  return group;
}
UserSchema.methods.createGroup = createGroup;

/**
 * Returns true if the password is correct.
 * @param password - The attempted password.
 * @return true if the password is correct.
 * @category User > Methods
 */
function verifyPassword(this: UserModel, password: string) {
  return new Promise<boolean>((resolve, reject) => {
    bcrypt.compare(password, this.password, (err, same) => {
      if (err) return reject(err);
      resolve(same);
    });
  });
}
UserSchema.methods.verifyPassword = verifyPassword;
