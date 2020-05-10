import { Model, Document } from "mongoose";
import { GroupSchema, GroupSchemaPopulated } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { UserModel } from "../users";
import { GroupMethods } from "./methods";
import { Member } from "../members";
import { Group } from ".";

interface GroupModel extends GroupSchema, Document, GroupMethods {}
interface GroupModelPopulated
  extends GroupSchemaPopulated,
    Document,
    GroupMethods {}
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
 * @returns the newly created group.
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

  return await group.save();
};

/** Get group
 * @param _id - ID of the group.
 * @returns The group.
 * @throws IDNotfoundError.
 */
GroupSchema.statics.getGroup = async function getGroup(
  this: GroupEntity,
  _id: string
) {
  const group = await Group.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Can not get group.");
  return group;
};

/**
 * Update Group
 * @param _id - ID of the Group.
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 *
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
 * @throws IDNotFoundError
 */
GroupSchema.statics.deleteGroup = async function deleteGroup(
  this: GroupEntity,
  _id: string
) {
  const group = await this.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Can not delete group.");

  // disconnect members of the group.
  const memberPromises = group.members.map(async (_id) => {
    await Member.deleteMember(_id, group._id.toString());
  });
  await Promise.all(memberPromises);
  //delete perform BFS and delete all
  const queue: GroupModel[] = [group];
  const promises: Promise<GroupModel>[] = [];
  while (queue.length) {
    const group = queue.shift();
    if (!group) break; // this will not happen.

    const populatedGroup: GroupModelPopulated = (await group
      .populate("subgroups")
      .execPopulate()) as any;
    const groups: GroupModel[] = populatedGroup.subgroups;
    queue.push(...groups);
    promises.push(group.remove());
  }

  await Promise.all(promises);
};
