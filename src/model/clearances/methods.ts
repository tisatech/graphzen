import { ClearanceSchema } from "./schema";
import { ClearanceModel } from "./interfaces";
import { MemberModel, Member } from "../members";
import { GroupModel, Group } from "../groups";
import { UserModel } from "../users";
import { Clearance } from ".";
import {
  ClearanceAlreadyAssignedError,
  RequirementNotFoundError,
  ClearanceProgressNotFoundError,
  ClearanceNotAssignedError,
  MemberPartOfGroupError,
  GroupNotAssignedInClearanceError,
} from "../../lib/errors";
import { RequirementModel, Requirement } from "../requirements";
import {
  ClearanceProgress,
  ClearanceProgressModel,
} from "../clearanceProgress";
import { RequirementProgress } from "../requirementProgress";
import { ItemProgress } from "../itemProgress";
import { Item } from "../items";

export interface ClearanceMethods {
  assignMember(member: MemberModel): Promise<void>;
  unassignMember(memberID: MemberModel["_id"]): Promise<void>;
  assignGroup(group: GroupModel["_id"]): Promise<void>;
  unassignGroup(group: GroupModel["_id"]): Promise<void>;

  fork(
    forkedBy: UserModel["_id"],
    groupID: GroupModel["_id"]
  ): Promise<ClearanceModel>;

  getProgress(memberID: string): Promise<ClearanceProgressModel>;
  getAllMembers(): Promise<string[]>;

  applyNewRequirement(requirementID: string): Promise<void>;
  applyRemoveRequirement(requirementID: string): Promise<void>;
  applyNewMember(memberID: string): Promise<void>;
  applyRemoveMember(memberID: string): Promise<void>;
  applyNewGroup(groupID: string): Promise<void>;
  applyRemoveGroup(groupID: string): Promise<void>;

  addRequirement(
    name: string,
    assignedMember: string
  ): Promise<RequirementModel>;
  removeRequirement(_id: string): Promise<void>;
}

/**
 * Assign a member in clearance.
 * @param member - The member model.
 */
const assignMember: ClearanceMethods["assignMember"] = async function (
  this: ClearanceModel,
  member: MemberModel
) {
  // check if already assigned.
  const isAlreadyAssigned = this.assignedMembers.some(
    (m) => member._id.toString() == m.toString()
  );
  if (isAlreadyAssigned)
    throw new ClearanceAlreadyAssignedError(
      "Can not assign clearance. Member is already assigned."
    );

  // check if already part of a group.
  const groups = member.groups.map((x) => x.group.toString());
  const assignedGroups = this.assignedGroups.map((x) => x.toString());
  const isPartOfGroup = groups.some((groupID) =>
    assignedGroups.includes(groupID)
  );
  if (isPartOfGroup)
    throw new ClearanceAlreadyAssignedError(
      "Can not assign clearance. Member is part of an assigned group."
    );

  this.assignedMembers.push(member._id.toString());
  this.isModifiedClearance = true;
  await this.save();
};
ClearanceSchema.methods.assignMember = assignMember;

/**
 * Unassign a member in clearance.
 * @param memberID - The ID of the member.
 */
const unassignMember: ClearanceMethods["unassignMember"] = async function (
  this: ClearanceModel,
  memberID: string
) {
  // check if assigned.
  const member = await Member.getMember(memberID);
  const memberIndex = this.assignedMembers.findIndex(
    (m) => member._id.toString() == m.toString()
  );
  const isAssigned = memberIndex != -1;

  // check if part of a group.
  const groups = member.groups.map((x) => x.group.toString());
  const assignedGroups = this.assignedGroups.map((x) => x.toString());
  const groupIndex = assignedGroups.findIndex((x) => groups.includes(x));
  const isPartOfGroup = groupIndex != -1;

  if (!isAssigned && !isPartOfGroup)
    throw new ClearanceNotAssignedError(
      "Can not unassign member. Member is not part of an assigned group."
    );

  if (isPartOfGroup && !isAssigned) {
    throw new MemberPartOfGroupError(
      "Can not unassign member. Member is part of a group. Please remove the group instead."
    );
  }

  this.assignedMembers.splice(memberIndex, 1);

  this.isModifiedClearance = true;
  await this.save();
};
ClearanceSchema.methods.unassignMember = unassignMember;

/**
 * Assign the group members in the clearance.
 * @param group - The ID of the group.
 */
const assignGroup: ClearanceMethods["assignGroup"] = async function (
  this: ClearanceModel,
  groupID: string
) {
  const isPartOfGroup = this.assignedGroups.some(
    (x) => x.toString() == groupID
  );
  if (isPartOfGroup)
    throw new ClearanceAlreadyAssignedError("Can not assign group.");

  const group = await Group.getGroup(groupID);
  const members = group.members.map((x) => x.toString());

  this.assignedMembers = this.assignedMembers.filter(
    (x) => !members.includes(x.toString())
  );
  this.assignedGroups.push(group._id.toString());
  this.isModifiedClearance = true;
  await this.save();
};
ClearanceSchema.methods.assignGroup = assignGroup;

/**
 * Assign the group members in the clearance.
 * @param group - The ID of the group.
 */
const unassignGroup: ClearanceMethods["unassignGroup"] = async function (
  this: ClearanceModel,
  group: string
) {
  const groupIndex = this.assignedGroups.findIndex(
    (x) => x.toString() == group
  );
  const isPartOfGroup = groupIndex != -1;

  if (!isPartOfGroup)
    throw new GroupNotAssignedInClearanceError("Can not unassign group.");

  this.assignedGroups.splice(groupIndex, 1);
  this.isModifiedClearance = true;
  await this.save();
};
ClearanceSchema.methods.unassignGroup = unassignGroup;

/**
 * Fork an existing clearance.
 * @param forkedBy ID of user to fork the service from.
 * @param groupID ID of the group to where the clearance will be scoped.
 */
const fork: ClearanceMethods["fork"] = async function (
  this: ClearanceModel,
  forkedBy: string,
  groupID: string
) {
  const { name, description, requirements } = this;
  const clearance = await Clearance.createClearance({
    name,
    description,
    createdBy: forkedBy,
    scope_group: groupID,
  });
  clearance.forkedFrom = this._id.toString();

  const requirementDocuments = await Requirement.find({
    _id: { $in: requirements },
  }).exec();
  const promises = requirementDocuments.map(async (requirement) => {
    const forkedRequirement = await clearance.addRequirement(
      requirement.name,
      requirement.assignedMember
    );
    const itemDocuments = await Item.find({ _id: { $in: requirement.items } });
    const itemPromises = itemDocuments.map(async (item) => {
      const forkedItem = await forkedRequirement.addItem(
        item.name,
        item.description
      );
      forkedItem.approvalType = item.approvalType;
      forkedItem.approval = item.approval;
      forkedItem.deadline = item.deadline;
      forkedItem.hasDeadline = item.hasDeadline;
      await forkedItem.save();
    });
    await Promise.all(itemPromises);
  });
  await Promise.all(promises);
  await clearance.save();
  return clearance;
};
ClearanceSchema.methods.fork = fork;

/**
 * Add a requirement in the clearance.
 * @param name - The name of the requirement.
 * @param assignedMember - The ID of the assigned member.
 */
const addRequirement: ClearanceMethods["addRequirement"] = async function (
  this: ClearanceModel,
  name: string,
  assignedMember: string
) {
  const requirement = await Requirement.createRequirement({
    name,
    assignedMember,
  });
  requirement.clearance = this._id.toString();
  await requirement.save();
  this.requirements.push(requirement._id.toString());
  await this.save();
  return requirement;
};
ClearanceSchema.methods.addRequirement = addRequirement;

/**
 * Remove requirement.
 * @param _id - The _id of the requirement to be removed.
 */
const removeRequirement: ClearanceMethods["removeRequirement"] = async function (
  this: ClearanceModel,
  _id: string
) {
  const requirementIndex = this.requirements.indexOf(_id);
  const requirementID = this.requirements[requirementIndex];

  if (requirementIndex == -1)
    throw new RequirementNotFoundError(
      "Can not remove requirement in the clearance."
    );

  this.requirements.splice(requirementIndex, 1);
  await this.save();
  await Requirement.deleteRequirement(requirementID);
};
ClearanceSchema.methods.removeRequirement = removeRequirement;

/**
 * Get the union of members and assigned group members in which this clearance is assigned.
 */
const getAllMembers: ClearanceMethods["getAllMembers"] = async function (
  this: ClearanceModel
) {
  const membersFromGroup = (
    await Member.find(
      { "groups.group": { $in: this.assignedGroups } },
      "_id"
    ).exec()
  ).map((x) => x._id.toString());
  const memberIDsWithDuplicate = this.assignedMembers.concat(membersFromGroup);
  const memberIDs = memberIDsWithDuplicate.filter(
    (id, idx) => memberIDsWithDuplicate.indexOf(id) == idx
  );
  return memberIDs;
};
ClearanceSchema.methods.getAllMembers = getAllMembers;

/**
 * Get the clearance progress of a member.
 * @param memberID - The ID of the member.
 */
const getProgress: ClearanceMethods["getProgress"] = async function (
  this: ClearanceModel,
  memberID: string
) {
  const clearanceProgress = await ClearanceProgress.findOne({
    member: memberID,
    definition: this._id.toString(),
  });
  if (!clearanceProgress)
    throw new ClearanceProgressNotFoundError("Can not get clearance progress.");

  return clearanceProgress;
};
ClearanceSchema.methods.getProgress = getProgress;

/**
 * Propagate changes when a new requirement is added to the clearance.
 * @param requirementID - The requirement ID.
 */
const applyNewRequirement: ClearanceMethods["applyNewRequirement"] = async function (
  this: ClearanceModel,
  requirementID: string
) {
  const memberIDs = await this.getAllMembers();
  const promises = memberIDs.map(async (member) => {
    const clearanceProgress = await this.getProgress(member);
    const requirementProgress = await RequirementProgress.createRequirementProgress(
      {
        member,
        definition: requirementID,
        parent: clearanceProgress._id.toString(),
      }
    );
    clearanceProgress.requirements.push(requirementProgress._id.toString());
    await clearanceProgress.save();
  });
  await Promise.all(promises);

  const requirement = await Requirement.findOne({
    _id: requirementID,
  }).exec();

  if (!requirement)
    throw new RequirementNotFoundError("Can not apply new requirement");

  const itemsPromises = requirement.items.map(async (itemID) => {
    await requirement.applyNewItem(itemID);
  });
  await Promise.all(itemsPromises);
};
ClearanceSchema.methods.applyNewRequirement = applyNewRequirement;

/**
 * Propagate changes when a new requirement is removed.
 * @param requirementID The requirement removed.
 */
const applyRemoveRequirement: ClearanceMethods["applyRemoveRequirement"] = async function (
  this: ClearanceModel,
  requirementID: string
) {
  const memberIDs = await this.getAllMembers();
  const requirementProgress = await RequirementProgress.find({
    member: { $in: memberIDs },
    definition: requirementID,
  });
  const requirementProgressIds = requirementProgress.map((x) =>
    x._id.toString()
  );
  await RequirementProgress.deleteMany({ _id: requirementProgressIds }).exec();
  await ItemProgress.deleteMany({
    parent: { $in: requirementProgressIds },
  }).exec();

  const promises = memberIDs.map(async (member) => {
    const clearanceProgress = await this.getProgress(member);
    const index = clearanceProgress.requirements.findIndex((x) =>
      requirementProgressIds.includes(x.toString())
    );
    clearanceProgress.requirements.splice(index, 1);
    await clearanceProgress.save();
  });
  await Promise.all(promises);
};
ClearanceSchema.methods.applyRemoveRequirement = applyRemoveRequirement;

/**
 * Propagate changes when a new member is assigned.
 * @param memberID - The ID of the member
 */
const applyNewMember: ClearanceMethods["applyNewMember"] = async function (
  this: ClearanceModel,
  memberID: string
) {
  const clearanceProgress = await ClearanceProgress.createClearanceProgress({
    definition: this._id.toString(),
    member: memberID,
  });
  const { requirements } = this;
  const promises = requirements.map(async (requirementID) => {
    const requirementProgress = await RequirementProgress.createRequirementProgress(
      {
        member: memberID,
        definition: requirementID,
        parent: clearanceProgress._id,
      }
    );

    const requirement = await Requirement.getRequirement(requirementID);
    const itemPromises = requirement.items.map(async (itemID) => {
      return await ItemProgress.createItemProgress({
        definition: itemID,
        member: memberID,
        parent: requirementProgress._id.toString(),
      });
    });
    const itemProgress = await Promise.all(itemPromises);

    requirementProgress.items.push(
      ...itemProgress.map((x) => x._id.toString())
    );
    return await requirementProgress.save();
  });
  const requirementProgress = await Promise.all(promises);
  clearanceProgress.requirements = requirementProgress.map((x) =>
    x._id.toString()
  );
  await clearanceProgress.save();
};
ClearanceSchema.methods.applyNewMember = applyNewMember;

/**
 * Propagate changes when a new member is removed.
 * @param memberID - The ID of the member
 */
const applyRemoveMember: ClearanceMethods["applyRemoveMember"] = async function (
  this: ClearanceModel,
  memberID: string
) {
  const clearanceProgress = await this.getProgress(memberID);
  const requirementsProgress = await RequirementProgress.find({
    parent: clearanceProgress._id.toString(),
    member: memberID,
  });
  const requirementProgressIDs = requirementsProgress.map((x) =>
    x._id.toString()
  );
  const itemsProgress = await ItemProgress.find({
    parent: { $in: requirementProgressIDs },
    member: memberID,
  }).exec();
  const itemsProgressIDs = itemsProgress.map((x) => x._id.toString());

  await ItemProgress.deleteMany({ _id: { $in: itemsProgressIDs } }).exec();
  await RequirementProgress.deleteMany({
    _id: { $in: requirementProgressIDs },
  }).exec();
  await clearanceProgress.remove();
};
ClearanceSchema.methods.applyRemoveMember = applyRemoveMember;

/**
 * Propagate changes when a new group is assigend.
 * @param groupID - The ID of the group
 */
const applyNewGroup: ClearanceMethods["applyNewGroup"] = async function (
  this: ClearanceModel,
  groupID: string
) {
  const group = await Group.getGroup(groupID);
  const newMembers = group.members.filter(
    (x) => !this.assignedMembers.includes(x)
  );
  const promises = newMembers.map(async (memberID) => {
    await this.applyNewMember(memberID);
  });
  await Promise.all(promises);
};
ClearanceSchema.methods.applyNewGroup = applyNewGroup;

/**
 * Propagate changes when a group is removed.
 * @param groupID - The ID of the group
 */
const applyRemoveGroup: ClearanceMethods["applyRemoveGroup"] = async function (
  this: ClearanceModel,
  groupID: string
) {
  const group = await Group.getGroup(groupID);
  const newMembers = group.members.filter(
    (x) => !this.assignedMembers.includes(x)
  );
  const promises = newMembers.map(async (memberID) => {
    await this.applyRemoveMember(memberID);
  });
  await Promise.all(promises);
};
ClearanceSchema.methods.applyRemoveGroup = applyRemoveGroup;
