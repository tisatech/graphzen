import { Model, Document } from "mongoose";
import { UserSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { Group } from "../groups";
import { UserMethods } from "./methods";

interface UserModel extends UserSchema, Document, UserMethods {}
interface UserEntity extends UserStatics, Model<UserModel> {}

export interface UserStatics {
  createUser: (payload: INewUserPayload) => Promise<UserModel>;
  getUser: (_id: string) => Promise<UserModel>;
  updateUser: (_id: string, payload: IUpdateUserPayload) => Promise<void>;
  deleteUser: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new User
 */
interface INewUserPayload {
  name: UserSchema["name"];
  email: UserSchema["email"];
  password: UserSchema["password"];
}
/**
 * Interface payload for updating new User
 */
interface IUpdateUserPayload {
  name: UserSchema["name"];
  email: UserSchema["email"];
  password: UserSchema["password"];
}

/**
 * Create a new user
 * @param payload.name - The name of the user.
 * @param payload.email - The email of the user.
 * @param payload.password - The password of the user.
 *
 * @returns the newly created user.
 */
UserSchema.statics.createUser = async function createUser(
  this: UserEntity,
  payload: INewUserPayload
) {
  const { name, email, password } = payload;
  const user = new this();
  user.name = name;
  user.email = email;
  user.password = password;
  return await user.save();
};

/**
 * Get user
 * @param _id - ID of the user.
 *
 * @returns the requested user.
 * @throws IDNotFoundError
 */
UserSchema.statics.getUser = async function getUser(
  this: UserEntity,
  _id: string
) {
  const user = await this.findById(_id).exec();
  if (!user) throw new IDNotFoundError("Cannot get User.");
  return user;
};

/**
 * Update a user
 * @param _id - ID of the user.
 * @param payload.name - The name of the user.
 * @param payload.email - The email of the user.
 * @param payload.password - The password of the user.
 *
 * @throws IDNotFoundError
 */
UserSchema.statics.updateUser = async function updateUser(
  this: UserEntity,
  _id: string,
  payload: IUpdateUserPayload
) {
  const user = await this.findById(_id).exec();
  if (!user) throw new IDNotFoundError("Cannot update user.");

  const props: (keyof IUpdateUserPayload)[] = ["name", "password", "email"];
  for (const prop of props)
    if (payload.hasOwnProperty(prop)) user[prop] = payload[prop];

  await user.save();
};

/**
 * Delete a user, turn memberships into shadow members, and delete created groups.
 * @param _id - ID of the user.
 *
 * @throws IDNotFoundError
 */
UserSchema.statics.deleteUser = async function deleteUser(
  this: UserEntity,
  _id: string
) {
  const user = await this.findById(_id).exec();
  if (!user) throw new IDNotFoundError("Can not delete user.");

  // Delete created groups.
  const promisesGroups = user.owned_groups.map(async (groupID) => {
    await Group.deleteGroup(groupID);
  });
  await Promise.all(promisesGroups);

  // Turn memberships into shadow accounts.
  const members = await user.getMembers();
  const promisesMembers = members.map(async (member) => {
    await member.unassignUser();
  });
  await Promise.all(promisesMembers);
  await user.remove();
};
