import { Model, Document } from "mongoose";
import { MemberSchema } from "./schema";
import { IDNotFoundError, GroupIDNotFoundError } from "../../lib/errors";
import { MemberMethods } from "./methods";
import { Group } from "../groups";

interface MemberModel extends MemberSchema, Document, MemberMethods {}
interface MemberEntity extends MemberStatics, Model<MemberModel> {}

export interface MemberStatics {
  createMember: (payload: INewMemberPayload) => Promise<MemberModel>;
  getMember: (_id: string) => Promise<MemberModel>;
  updateMember: (_id: string, payload: IUpdateMemberPayload) => Promise<void>;
  deleteMember: (_id: string, groupID: string) => Promise<void>;
}

/**
 * Interface payload for creating new Member
 */
export interface INewMemberPayload {
  scope_group: MemberSchema["scope_group"];
  nickname: MemberSchema["groups"][0]["nickname"];
  customID: MemberSchema["groups"][0]["customID"];
}
/**
 * Interface payload for updating Member
 */
interface IUpdateMemberPayload {
  group: MemberSchema["groups"][0]["group"];
  nickname: MemberSchema["groups"][0]["nickname"];
  customID: MemberSchema["groups"][0]["customID"];
}

/**
 * Create a new Member
 * @param payload.scope_group - The group which will act as the root scope of the Member.
 * @param payload.nickname - The nickname or custom name of the Member.
 * @param payload.customID - The customId of the Member.
 * @returns The nelwy created member.
 */
MemberSchema.statics.createMember = async function createMember(
  this: MemberEntity,
  payload: INewMemberPayload
) {
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
};

/**
 * Get Member
 * @param _id - ID of the Member.
 *
 * @returns The requested member.
 * @throws IDNotFoundError
 */
MemberSchema.statics.getMember = async function getMember(
  this: MemberEntity,
  _id: string
) {
  const member = await this.findById(_id).exec();
  if (!member) throw new IDNotFoundError("Cannot get member.");
  return member;
};

/**
 * Update a Member
 * @param _id - ID of the Member.
 * @param payload.group - The group which the membership modification will take effect.
 * @param payload.nickname - The nickname or custom name of the Member.
 * @param payload.customID - The customId of the Member.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
MemberSchema.statics.updateMember = async function updateMember(
  this: MemberEntity,
  _id: string,
  payload: IUpdateMemberPayload
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
};

/**
 * Disconnects a member from a certain group. If the member is deleted from the scope, it will be removed from the database.
 * @param _id - ID of the Member.
 * @param groupID - The ID of the group where the member will be disconnected from.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
MemberSchema.statics.deleteMember = async function deleteMember(
  this: MemberEntity,
  _id: string,
  groupID: string
) {
  const member = await this.findById(_id).exec();
  if (!member) throw new IDNotFoundError("Cannot delete member.");

  const groupIndex = member.groups.findIndex(
    (groupItem) => groupItem.group.toString() == groupID
  );
  if (groupIndex == -1)
    throw new GroupIDNotFoundError(
      "Cannot delete member. Member is not part of the group."
    );

  // disconnect from groups.
  const group = await Group.findById(groupID);
  if (!group)
    throw new GroupIDNotFoundError(
      "Cannot delete member. Group is not defined."
    );
  const removedGroups = await group.removeMember(_id);
  member.groups = member.groups.filter(
    (groupItem) => !removedGroups.includes(groupItem.group.toString())
  );
  console.log(member.scope_group.toString(), groupID);
  if (member.scope_group.toString() == groupID) await member.remove();
  else await member.save();
};
