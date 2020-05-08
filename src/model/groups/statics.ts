import { Model, Document } from "mongoose";
import { GroupSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { UserModel } from "../users";
import { GroupMethods } from "./methods";

interface GroupModel extends GroupSchema, Document, GroupMethods {}
interface GroupEntity extends GroupStatics, Model<GroupModel> {}

export interface GroupStatics {
  createGroup: (payload: INewGroupPayload) => Promise<GroupModel>;
  getGroup: (_id: string) => Promise<GroupModel>;
  updateGroup: (_id: string, payload: IUpdateGroupPayload) => Promise<void>;
  deleteGroup: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new Group
 */
export interface INewGroupPayload {
  name: GroupSchema["name"];
  description: GroupSchema["description"];
  createdBy: UserModel["_id"];
  parentGroup?: GroupSchema["parentGroup"];
}
/**
 * Interface payload for updating new Group
 */
interface IUpdateGroupPayload {
  name: GroupSchema["name"];
  description: GroupSchema["description"];
}

/**
 * Create a new Group
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @param payload.createdBy - The user who created the group.
 * @param payload.parentGroup - The group in which this group is created.
 * @returns Promise<GroupModel>
 */
GroupSchema.statics.createGroup = async function createGroup(
  this: GroupEntity,
  payload: INewGroupPayload
) {
  const { name, description, createdBy, parentGroup } = payload;
  const group = new this();
  group.name = name;
  group.description = description;
  group.createdBy = createdBy;

  if (parentGroup) {
    group.isRoot = false;
    group.parentGroup = parentGroup;
  } else group.parentUser = createdBy;

  await group.save();
};

/**
 * Get Group
 * @param _id - ID of the Group.
 *
 * @returns Promise<GroupModel>
 * @throws IDNotFoundError
 */
GroupSchema.statics.getGroup = async function getGroup(
  this: GroupEntity,
  _id: string
) {
  const Group = await this.findById(_id).exec();
  if (!Group) throw new IDNotFoundError("Group ID not found.");
  return Group;
};

/**
 * Update a Group
 * @param _id - ID of the Group.
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 *
 * @returns Promise<void>
 * @throws IDNotFoundError
 */
GroupSchema.statics.updateGroup = async function updateGroup(
  this: GroupEntity,
  _id: string,
  payload: IUpdateGroupPayload
) {
  const group = await this.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Cannot update group.");

  const props: (keyof IUpdateGroupPayload)[] = ["name", "description"];
  for (const prop of props)
    if (payload.hasOwnProperty(prop)) group[prop] = payload[prop];

  await group.save();
};

/**
 * Delete a Group
 * @param _id - ID of the Group.
 *
 * @returns Promise<void>
 * @throws IDNotFoundError
 */
GroupSchema.statics.deleteGroup = async function deleteGroup(
  this: GroupEntity,
  _id: string
) {
  const group = await this.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Can not delete group.");

  // disconnect members of the group.
  // -- TODO

  //delete subgroups;
  const promises = group.subgroups.map(async (groupID) => {
    await group.removeGroup(groupID);
  });

  await Promise.all(promises);
  await group.remove();
};
