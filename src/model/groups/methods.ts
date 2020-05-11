import { GroupSchema } from "./schema";
import { MemberModel, Member } from "../members";
import { UserModel, User } from "../users";
import { Model, model } from "mongoose";
import { NewGroupPayload, GroupStatics } from "./statics";
import {
  GroupIDNotFoundError,
  GroupHasNoParentError,
  UserAlreadyInGroup,
} from "../../lib/errors";
import { Group, GroupModel } from ".";
import { GroupEntity } from "./interfaces";

/**
 * Interface for the methods of Group documents.
 * @category Group
 */
export interface GroupMethods {
  addMember: (user?: UserModel) => Promise<MemberModel>;
  removeMember: (member: MemberModel["_id"]) => Promise<void>;
  addGroup: (payload: NewGroupPayload) => Promise<GroupModel>;
  removeGroup: (_id: GroupModel["_id"]) => Promise<void>;
  forkAsChild: (createdBy: UserModel["_id"]) => Promise<GroupModel>;
  forkAsSibling: (createdBy: UserModel["_id"]) => Promise<GroupModel>;
}

/**
 * Add a new member in the group
 * @param user - User to be added
 * @return The member created.
 * @category Group > Methods
 */
async function addMember(
  this: GroupModel,
  user?: UserModel
): Promise<MemberModel> {
  const { isRoot } = this;

  if (user) {
    const members = await Member.find({
      "groups.group": this._id.toString(),
      user: user._id.toString(),
    }).exec();
    if (members.length) throw new UserAlreadyInGroup("Can not add member.");
  }

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
    if (!member) {
      const member = await Member.createMember({
        nickname: user.name,
        customID: "No ID",
        scope_group: this._id.toString(),
      });
      await member.assignUser(user._id.toString());
      this.members.push(member._id.toString());
      await this.save();
      return member;
    }

    const parentGroupItem = member.groups.find(
      (groupItem) => groupItem.group == parent._id.toString()
    );
    if (!parentGroupItem) {
      throw new GroupIDNotFoundError("Can not add new member.");
    }

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
}
GroupSchema.methods.addMember = addMember;

/**
 * Remove a member in the group. Returns all the groups where the member is removed.
 * @param _id - Id of the member.
 * @category Group > Methods
 * @throws MemberIDNotFoundError
 */
async function removeMember(this: GroupModel, _id: string) {
  await Member.deleteMember(_id, this._id.toString());
}
GroupSchema.methods.removeMember = removeMember;

/**
 * Add a new subgroup.
 * @category Group > Methods
 * @return The newly created group.
 */
async function addGroup(this: GroupModel, payload: NewGroupPayload) {
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
}
GroupSchema.methods.addGroup = addGroup;

/**
 * Remove a subgroup.
 * @param _id - The ID of the Group.
 * @category Group > Methods
 */
async function removeGroup(this: GroupModel, _id: string) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  const index = this.subgroups.indexOf(_id);
  if (index == -1) throw new GroupIDNotFoundError("Can not remove group.");

  this.subgroups.splice(index, 1);
  await this.save();
  await Group.deleteGroup(_id);
}
GroupSchema.methods.removeGroup = removeGroup;

/**
 * Fork the current group as child group.
 * @param createdBy - The user who forked the group
 * @category Group > Methods
 * @return The newly created group.
 */
async function forkAsChild(this: GroupModel, createdBy: UserModel["_id"]) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  const group = await Group.createGroup({
    name: this.name + " - Copy",
    description: this.description,
    createdBy,
    parentGroup: this._id,
  });
  this.members.forEach((memberId) => {
    group.members.push(memberId);
  });
  await group.save();

  // Assign new group to members.
  const members = await Member.find({ _id: { $in: this.members } }).exec();
  const promises = members.map(async (member) => {
    const oldGroup = member.groups.find(
      (groupItem) => groupItem.group.toString() == this._id.toString()
    );
    if (!oldGroup) {
      throw new GroupIDNotFoundError(
        "Cannot update member details when forking."
      );
    }

    const { nickname, customID } = oldGroup;
    member.groups.push({
      group: group._id.toString(),
      nickname,
      customID,
    });
    await member.save();
  });
  await Promise.all(promises);

  this.subgroups.push(group._id);
  await this.save();
  return group;
}
GroupSchema.methods.forkAsChild = forkAsChild;

/**
 * Fork the current group as child group.
 * @param createdBy - The user who forked the group
 * @category Group > Methods
 * @return The newly created group.
 */
async function forkAsSibling(this: GroupModel, createdBy: UserModel["_id"]) {
  const Group: GroupEntity = model<
    GroupModel,
    Model<GroupModel> & GroupStatics
  >("Group");

  // Create new Group
  const group = await Group.createGroup({
    name: this.name + " - Copy",
    description: this.description,
    createdBy,
    parentGroup: this.parentGroup,
  });
  this.members.forEach((memberId) => {
    group.members.push(memberId);
  });
  await group.save();

  // Assign new group to members.
  const members = await Member.find({ _id: { $in: this.members } }).exec();
  const promises = members.map(async (member) => {
    const oldGroup = member.groups.find(
      (groupItem) => groupItem.group.toString() == this._id.toString()
    );
    if (!oldGroup) {
      throw new GroupIDNotFoundError(
        "Cannot update member details when forking."
      );
    }

    const { nickname, customID } = oldGroup;
    member.groups.push({
      group: group._id.toString(),
      nickname,
      customID,
    });
    await member.save();
  });
  await Promise.all(promises);

  // Assign group to the parent.
  if (this.isRoot) {
    const parentUser = await User.getUser(this.createdBy.toString());
    parentUser.owned_groups.push(group._id);
    await parentUser.save();
  } else {
    const parentGroup = await Group.getGroup(this.parentGroup);
    parentGroup.subgroups.push(group._id);
    await parentGroup.save();
  }

  return group;
}
GroupSchema.methods.forkAsSibling = forkAsSibling;
