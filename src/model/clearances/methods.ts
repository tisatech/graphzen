import { ClearanceSchema } from "./schema";
import { ClearanceModel } from "./interfaces";
import { MemberModel, Member } from "../members";
import { GroupModel } from "../groups";
import { UserModel } from "../users";
import { Clearance } from ".";
import { ClearanceAlreadyAssignedError } from "../../lib/errors";

export interface ClearanceMethods {
  assignMember(member: MemberModel["_id"]): Promise<void>;
  assignGroup(group: GroupModel["_id"]): Promise<void>;
  fork(
    forkedBy: UserModel["_id"],
    groupID: GroupModel["_id"]
  ): Promise<ClearanceModel>;
  apply(): Promise<void>;
  //   addRequirement();
}

/**
 * Assign a member in clearance.
 * @param member - The ID of the member.
 */
const assignMember: ClearanceMethods["assignMember"] = async function (
  this: ClearanceModel,
  member: MemberModel
) {
  // check if already assigned.
  const isAlreadyAssigned = this.assignedMembers.some(
    (m) => member._id.toString() == m
  );
  if (isAlreadyAssigned)
    throw new ClearanceAlreadyAssignedError(
      "Can not assign clearance. Member is already assigned."
    );

  // check if already part of a group.
  const groups = member.groups.map((x) => x.group.toString());
  const isPartOfGroup = groups.some((groupID) => groups.includes(groupID));
  if (isPartOfGroup)
    throw new ClearanceAlreadyAssignedError(
      "Can not assign clearance. Member is part of an assigned group."
    );

  this.assignedMembers.push(member._id.toString());
  this.isModified = true;
  await this.save();
};
ClearanceSchema.methods.assignMember = assignMember;

/**
 * Assign the group members in the clearance.
 * @param group - THe ID of the group.
 */
const assignGroup: ClearanceMethods["assignGroup"] = async function (
  this: ClearanceModel,
  group: string
) {
  this.assignedGroups.push(group);
  this.isModified = true;
  await this.save();
};
ClearanceSchema.methods.assignGroup = assignGroup;

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

  //   + TODO
  // const forkedRequirements = await Requirements.forkRequirements(requirements);
  // clearance.requirements = forkedRequirements;

  await clearance.save();
  return clearance;
};
ClearanceSchema.methods.fork = fork;

/***
 * Propagate the changes in requirements/users/members.
 */
const apply: ClearanceMethods["apply"] = async function (this: ClearanceModel) {
  const members = await Member.find({
    _id: { $in: this.assignedMembers },
  }).exec();
  const memberPromises = members.map(async (member) => {
    // TODO for requirements.
  });
  await Promise.all(memberPromises);
};
ClearanceSchema.methods.apply = apply;
