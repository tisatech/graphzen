import { GroupSchema } from "./schema";
import { MemberModel } from "../members";
import { UserModel } from "../users";
import { Document, Model, model } from "mongoose";
import { INewGroupPayload, GroupStatics } from "./statics";
import { GroupIDNotFoundError } from "../../lib/errors";

export interface GroupMethods {
  addMember: (user?: UserModel["_id"]) => Promise<MemberModel>;
  removeMember: (member: MemberModel["_id"]) => Promise<void>;
  addGroup: (payload: INewGroupPayload) => Promise<GroupModel>;
  removeGroup: (_id: GroupModel["_id"]) => Promise<void>;
  forkAsChild: (createdBy: UserModel["_id"]) => Promise<GroupModel>;
  forkAsSibling: (createdBy: UserModel["_id"]) => Promise<GroupModel>;
}

interface GroupModel extends GroupSchema, Document, GroupMethods {}
interface GroupEntity extends GroupStatics, Model<GroupModel> {}

/**
 * Add a new member in the group
 * @param user - User to be added
 * @returns Promise<Member>
 */
GroupSchema.methods.addMember = async function addMember() {};

/**
 * Add a new member in the group
 * @param user - User to be added
 * @returns Promise<Member>
 * @throws MemberIDNotFoundError
 */
GroupSchema.methods.removeMember = async function removeMember() {};

/**
 * Add a new subgroup.
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @param payload.createdBy - The user who created the group.
 * @returns Promise<void>
 */

GroupSchema.methods.addGroup = async function addGroup(
  this: GroupModel,
  payload: INewGroupPayload
) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  const group = await Group.createGroup({
    ...payload,
    parentGroup: this._id,
  });
  await group.save();

  this.subgroups.push(group._id);
  await this.save();
  return group;
};

/**
 * Remove a subgroup.
 * @param _id - The ID of the Group.
 * @returns Promise<void>
 */
GroupSchema.methods.removeGroup = async function removeGroup(
  this: GroupModel,
  _id: string
) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  const index = this.subgroups.indexOf(_id);
  if (index == -1) throw new GroupIDNotFoundError("Can not remove group.");

  this.subgroups.splice(index, 1);
  await this.save();
  await Group.deleteGroup(_id);
};

/**
 * Fork the current group as child group.
 * @param createdBy - The user who forked the group
 * @returns Promise<Group>
 */
GroupSchema.methods.forkAsChild = async function forkAsChild(
  this: GroupModel,
  createdBy: UserModel["_id"]
) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  const group = await Group.createGroup({
    name: this.name + "- Copy",
    description: "",
    createdBy,
    parentGroup: this._id,
  });

  this.members.forEach((memberId) => {
    group.members.push(memberId);
  });
  await group.save();

  this.subgroups.push(group._id);
  await this.save();
  return group;
};

/**
 * Fork the current group as child group.
 * @param createdBy - The user who forked the group
 * @returns Promise<Group>
 */
GroupSchema.methods.forkAsSibling = async function forkAsSibling(
  this: GroupModel,
  createdBy: UserModel["_id"]
) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  // Create new Group
  const group = await Group.createGroup({
    name: this.name + "- Copy",
    description: "",
    createdBy,
    parentGroup: this.parentGroup,
  });
  this.members.forEach((memberId) => {
    group.members.push(memberId);
  });
  await group.save();

  // Assign group to the parent.
  const parentGroup = await Group.getGroup(this.parentGroup);
  parentGroup.subgroups.push(group._id);
  await parentGroup.save();

  return group;
};
