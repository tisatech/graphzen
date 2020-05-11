import { UserSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { Group } from "../groups";
import { UserModel } from ".";
import { UserEntity } from "./interfaces";

/**
 * User schema static methods.
 * @category User
 */
export interface UserStatics {
  createUser: (payload: NewUserPayload) => Promise<UserModel>;
  getUser: (_id: string) => Promise<UserModel>;
  updateUser: (_id: string, payload: UpdateUserPayload) => Promise<void>;
  deleteUser: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new User
 * @category User
 */
interface NewUserPayload {
  /** The name of the new user */
  name: UserSchema["name"];
  /** The email of the new user */
  email: UserSchema["email"];
  /** The password of the new user */
  password: UserSchema["password"];
}
/**
 * Interface payload for updating new User
 * @category User
 */
interface UpdateUserPayload {
  /** The name of the new user */
  name: UserSchema["name"];
  /** The email of the new user */
  email: UserSchema["email"];
  /** The password of the new user */
  password: UserSchema["password"];
}

/**
 * Create a new user
 * @return the newly created user.
 * @category User > Statics
 */
async function createUser(this: UserEntity, payload: NewUserPayload) {
  const { name, email, password } = payload;
  const user = new this();
  user.name = name;
  user.email = email;
  user.password = password;
  return await user.save();
}
UserSchema.statics.createUser = createUser;

/**
 * Get user
 * @param _id - ID of the user.
 * @return the requested user.
 * @throws IDNotFoundError
 * @category User > Statics
 */
async function getUser(this: UserEntity, _id: string) {
  const user = await this.findById(_id).exec();
  if (!user) throw new IDNotFoundError("Cannot get User.");
  return user;
}
UserSchema.statics.getUser = getUser;

/**
 * Update a user
 * @param _id - ID of the user.
 * @category User > Statics
 * @throws IDNotFoundError
 */
async function updateUser(
  this: UserEntity,
  _id: string,
  payload: UpdateUserPayload
) {
  const user = await this.findById(_id).exec();
  if (!user) throw new IDNotFoundError("Cannot update user.");

  const props: (keyof UpdateUserPayload)[] = ["name", "password", "email"];
  for (const prop of props) {
    if (payload[prop]) user[prop] = payload[prop];
  }

  await user.save();
}
UserSchema.statics.updateUser = updateUser;

/**
 * Delete a user, turn memberships into shadow members, and delete created groups.
 * @param _id - ID of the user.
 * @category User > Statics
 * @throws IDNotFoundError
 */
async function deleteUser(this: UserEntity, _id: string) {
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
}
UserSchema.statics.deleteUser = deleteUser;
