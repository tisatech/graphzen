import { Model, Document } from "mongoose";
import { MemberSchema } from "./schema";
import { IDNotFoundError, GroupIDNotFoundError } from "../../lib/errors";
import { MemberMethods } from "./methods";
import { Group, GroupModel } from "../groups";

interface MemberModel extends MemberSchema, Document, MemberMethods {}
interface MemberEntity extends MemberStatics, Model<MemberModel> {}

export interface MemberStatics {
  createMember: (payload: NewMemberPayload) => Promise<MemberModel>;
  getMember: (_id: string) => Promise<MemberModel>;
  updateMember: (_id: string, payload: UpdateMemberPayload) => Promise<void>;
  deleteMember: (_id: string, groupID: string) => Promise<void>;
}

/**
 * Interface payload for creating new Member
 */
export interface NewMemberPayload {
  scope_group: MemberSchema["scope_group"];
  nickname: MemberSchema["groups"][0]["nickname"];
  customID: MemberSchema["groups"][0]["customID"];
}
/**
 * Interface payload for updating Member
 */
interface UpdateMemberPayload {
  group: MemberSchema["groups"][0]["group"];
  nickname: MemberSchema["groups"][0]["nickname"];
  customID: MemberSchema["groups"][0]["customID"];
}

/**
 * @ignore
 */
async function removeMembersGroup(baseGroup: GroupModel, _id: string) {
  // run BFS accross the tree. Find all the group nodes where the member is part of and disconnect them.
  const nodes: string[] = [];
  const queue: GroupModel[] = [baseGroup];
  const promises: Promise<GroupModel>[] = [];

  while (queue.length) {
    const group = queue.shift();
    if (!group) break; // this will never happen.

    const memberIndex = group.members.findIndex(
      (member) => member.toString() == _id
    );
    if (memberIndex != -1) {
      await group.populate("subgroups").execPopulate();
      nodes.push(group._id.toString());

      const subgroups: GroupModel[] = group.subgroups as any;
      queue.push(...subgroups);
      group.members.splice(memberIndex, 1);
      promises.push(group.save());
    }
  }

  await Promise.all(promises);
  return nodes;
}

/**
 * Create a new Member
 * @param payload.scope_group - The group which will act as the root scope of the Member.
 * @param payload.nickname - The nickname or custom name of the Member.
 * @param payload.customID - The customId of the Member.
 * @return The nelwy created member.
 */
async function createMember(this: MemberEntity, payload: NewMemberPayload) {
  const member = new this();
  const { scope_group, nickname, customID } = payload;

  member.scope_group = scope_group;
  member.groups.push({
    nickname,
    group: scope_group,
    customID,
  });
  member.isPublished = false;
  member.isShadow = true;

  return await member.save();
}
MemberSchema.statics.createMember = createMember;

/**
 * Get Member
 * @param _id - ID of the Member.
 *
 * @return The requested member.
 * @throws IDNotFoundError
 */
async function getMember(this: MemberEntity, _id: string) {
  const member = await this.findById(_id).exec();
  if (!member) throw new IDNotFoundError("Cannot get member.");
  return member;
}
MemberSchema.statics.getMember = getMember;

/**
 * Update a Member
 * @param _id - ID of the Member.
 * @param payload.group - The group which the membership modification will take effect.
 * @param payload.nickname - The nickname or custom name of the Member.
 * @param payload.customID - The customId of the Member.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function updateMember(
  this: MemberEntity,
  _id: string,
  payload: UpdateMemberPayload
) {
  const member = await this.findById(_id).exec();
  if (!member) throw new IDNotFoundError("Cannot update member.");

  const { group, nickname, customID } = payload;
  const selectedGroup = member.groups.find(
    (groupItem) => groupItem.group.toString() == group
  );

  if (!selectedGroup) throw new GroupIDNotFoundError("cannot update member.");

  selectedGroup.nickname = nickname;
  selectedGroup.customID = customID;

  await member.save();
}
MemberSchema.statics.updateMember = updateMember;

/**
 * Disconnects a member from a certain group. If the member is deleted from the scope, it will be removed from the database.
 * @param _id - ID of the Member.
 * @param groupID - The ID of the group where the member will be disconnected from.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteMember(this: MemberEntity, _id: string, groupID: string) {
  const member = await this.findById(_id).exec();
  if (!member) throw new IDNotFoundError("Cannot delete member.");

  const groupIndex = member.groups.findIndex(
    (groupItem) => groupItem.group.toString() == groupID
  );
  if (groupIndex == -1) {
    throw new GroupIDNotFoundError(
      "Cannot delete member. Member is not part of the group."
    );
  }

  // disconnect from groups.
  const group = await Group.findById(groupID);
  if (!group) {
    throw new GroupIDNotFoundError(
      "Cannot delete member. Group is not defined."
    );
  }

  // remove raw

  const removedGroups = await removeMembersGroup(group, _id);
  member.groups = member.groups.filter(
    (groupItem) => !removedGroups.includes(groupItem.group.toString())
  );

  if (member.scope_group.toString() == groupID) await member.remove();
  else await member.save();
}
MemberSchema.statics.deleteMember = deleteMember;
