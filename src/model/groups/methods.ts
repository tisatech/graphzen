import { GroupSchema } from "./schema";
import { MemberModel, Member } from "../members";
import { UserModel, User } from "../users";
import { Document, Model, model } from "mongoose";
import { INewGroupPayload, GroupStatics } from "./statics";
import {
  GroupIDNotFoundError,
  GroupHasNoParentError,
  UserNotInRoot,
} from "../../lib/errors";
import { Group } from ".";

export interface GroupMethods {
  addMember: (user?: UserModel) => Promise<MemberModel>;
  removeMember: (member: MemberModel["_id"]) => Promise<string[]>;
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
 * @returns The member created.
 */
GroupSchema.methods.addMember = async function addMember(
  this: GroupModel,
  user?: UserModel
) {
  const { isRoot } = this;

  if (isRoot) {
    const member = await Member.createMember({
      nickname: user ? user.name : "New Member",
      customID: "No ID",
      scope_group: this._id.toString(),
    });

    if (user) await member.assignUser(user._id.toString());
    this.members.push(member._id.toString());
    await this.save();
    return member;
  } else if (user) {
    // check if the member is existing in the parent.
    const parent = await Group.findOne({ subgroups: this._id.toString() });
    if (!parent) throw new GroupHasNoParentError("Can not add new member.");

    const parentMembers = await Member.find({
      _id: { $in: parent.members },
    }).exec();
    const member = parentMembers.find(
      (member) => member.user?.toString() == user._id.toString()
    );
    if (!member) throw new UserNotInRoot("Can not add new member.");

    const parentGroupItem = member.groups.find(
      (groupItem) => groupItem.group == parent._id.toString()
    );
    if (!parentGroupItem)
      throw new GroupIDNotFoundError("Can not add new member.");

    const { nickname, customID } = parentGroupItem;
    member.groups.push({
      nickname,
      customID,
      group: this._id.toString(),
    });
    await member.save();

    this.members.push(member._id.toString());
    await this.save();
    return member;
  } else {
    // Add shadow member in Group
    const member = await Member.createMember({
      nickname: "New Member",
      customID: "No ID",
      scope_group: this._id.toString(),
    });
    this.members.push(member._id.toString());
    await this.save();
    return member;
  }
};

/**
 * Remove a member in the group. Returns all the groups where the member is removed.
 * @param _id - Id of the member.
 * @returns The groups where the member is removed.
 * @throws MemberIDNotFoundError
 */
GroupSchema.methods.removeMember = async function removeMember(
  this: GroupModel,
  _id: string
) {
  // run BFS accross the tree. Find all the group nodes where the member is part of and disconnect them.
  const nodes: string[] = [];
  const queue: GroupModel[] = [this];
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
};

/**
 * Add a new subgroup.
 * @param payload.name - The name of the Group.
 * @param payload.description - The description of the Group.
 * @param payload.createdBy - The user who created the group.
 * @returns The newly created group.
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
    parentGroup: this._id.toString(),
  });
  await group.save();

  this.subgroups.push(group._id);
  await this.save();
  return group;
};

/**
 * Remove a subgroup.
 * @param _id - The ID of the Group.
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
 * @returns The newly created group.
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
    name: this.name + " - Copy",
    description: "",
    createdBy,
    parentGroup: this._id,
  });
  this.members.forEach((memberId) => {
    group.members.push(memberId);
  });
  await group.save();

  // Assign new members to group.
  const members = await Member.find({ _id: { $in: this.members } }).exec();
  const promises = members.map(async (member) => {
    const oldGroup = member.groups.find(
      (groupItem) => groupItem == this._id.toString()
    );
    if (!oldGroup)
      throw new GroupIDNotFoundError(
        "Cannot update member details when forking."
      );

    const { nickname, customID } = oldGroup;
    member.groups.push({
      group: this._id.toString(),
      nickname,
      customID,
    });
    await member.save();
  });
  await Promise.all(promises);

  this.subgroups.push(group._id);
  await this.save();
  return group;
};

/**
 * Fork the current group as child group.
 * @param createdBy - The user who forked the group
 * @returns The newly created group.
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
  await group.save();

  // add members to the group
  for (let _id of this.members) {
    const member = await Member.getMember(_id);

    if (member.user) {
      const user = await User.getUser(member.user);
      await group.addMember(user);
    } else await group.addMember();
  }

  // Assign group to the parent.
  const parentGroup = await Group.getGroup(this.parentGroup);
  parentGroup.subgroups.push(group._id);
  await parentGroup.save();

  return group;
};
