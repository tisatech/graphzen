import { GroupSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { UserModel } from "../users";
import { Member } from "../members";
import { Group, GroupModel } from ".";
import { GroupEntity, GroupModelPopulated } from "./interfaces";

/**
 * Group schema static methods.
 * @category Group
 */
export interface GroupStatics {
  createGroup: (payload: NewGroupPayload) => Promise<GroupModel>;
  getGroup: (_id: string) => Promise<GroupModel>;
  updateGroup: (_id: string, payload: UpdateGroupPayload) => Promise<void>;
  deleteGroup: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new Group
 * @category Group
 */
export interface NewGroupPayload {
  /** The name of the group. */
  name: GroupSchema["name"];
  /** The description of the group. */
  description: GroupSchema["description"];
  /** The ID of the user who created the group. */
  createdBy: UserModel["_id"];
  /** The ID of the parent group. */
  parentGroup?: GroupSchema["parentGroup"];
}
/**
 * Interface payload for updating new Group
 * @category Group
 */
interface UpdateGroupPayload {
  /** The name of the group. */
  name: GroupSchema["name"];
  /** The description of the group. */
  description: GroupSchema["description"];
}

/**
 * Create a new Group
 * @return the newly created group.
 * @category Group > Statics
 */
async function createGroup(this: GroupEntity, payload: NewGroupPayload) {
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
}
GroupSchema.statics.createGroup = createGroup;

/** Get group
 * @param _id - ID of the group.
 * @return The group.
 * @category Group > Statics
 * @throws IDNotfoundError.
 */
async function getGroup(this: GroupEntity, _id: string) {
  const group = await Group.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Can not get group.");
  return group;
}
GroupSchema.statics.getGroup = getGroup;

/**
 * Update Group
 * @param _id - ID of the Group.
 * @category Group > Statics
 *
 * @throws IDNotFoundError
 */
async function updateGroup(
  this: GroupEntity,
  _id: string,
  payload: UpdateGroupPayload
) {
  const group = await this.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Cannot update group.");

  const props: (keyof UpdateGroupPayload)[] = ["name", "description"];
  for (const prop of props) {
    if (payload[prop]) group[prop] = payload[prop];
  }

  await group.save();
}
GroupSchema.statics.updateGroup = updateGroup;

/**
 * Delete a Group
 * @param _id - ID of the Group.
 * @category Group > Statics
 *
 * @throws IDNotFoundError
 */
async function deleteGroup(this: GroupEntity, _id: string) {
  const group = await this.findById(_id).exec();
  if (!group) throw new IDNotFoundError("Can not delete group.");

  const memberIDs: string[] = [];
  const groupIDs: string[] = [];

  // delete perform BFS and delete all
  const queue: GroupModel[] = [group];
  while (queue.length) {
    const group = queue.shift();
    if (!group) break; // this will not happen.

    groupIDs.push(group._id.toString());
    group.members.forEach((id) => {
      const strID = id.toString();
      if (!memberIDs.includes(strID)) memberIDs.push(strID);
    });

    const populatedGroup: GroupModelPopulated = (await group
      .populate("subgroups")
      .execPopulate()) as any;

    const groups: GroupModel[] = populatedGroup.subgroups;
    queue.push(...groups);

    // TODO: parallelize this
    await group.remove();
  }

  // TODO: parallelize this
  for (const _id of memberIDs) {
    const member = await Member.getMember(_id.toString());
    member.groups = member.groups.filter(
      (groupItem) => !groupIDs.includes(groupItem.group.toString())
    );
    if (member.groups.length == 0) await member.remove();
    else await member.save();
  }
}
GroupSchema.statics.deleteGroup = deleteGroup;
