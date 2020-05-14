import { ClearanceSchema } from "./schema";
import { ClearanceModel } from "./interfaces";
import { MemberModel, Member } from "../members";
import { GroupModel } from "../groups";
import { UserModel } from "../users";
import { Clearance } from ".";
import {
  ClearanceAlreadyAssignedError,
  RequirementNotFoundError,
} from "../../lib/errors";
import { RequirementModel, Requirement } from "../requirements";
import { RequirementSchema } from "../requirements/schema";
import { ClearanceProgress } from "../clearanceProgress";

export interface ClearanceMethods {
  assignMember(member: MemberModel["_id"]): Promise<void>;
  assignGroup(group: GroupModel["_id"]): Promise<void>;
  fork(
    forkedBy: UserModel["_id"],
    groupID: GroupModel["_id"]
  ): Promise<ClearanceModel>;
  apply(): Promise<void>;
  addRequirement(name: string): Promise<RequirementModel>;
  removeRequirement(_id: string): Promise<void>;
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
  const isPartOfGroup = groups.some((groupID) =>
    this.assignedGroups.includes(groupID)
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
 * Assign the group members in the clearance.
 * @param group - THe ID of the group.
 */
const assignGroup: ClearanceMethods["assignGroup"] = async function (
  this: ClearanceModel,
  group: string
) {
  this.assignedGroups.push(group);
  this.isModifiedClearance = true;
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
  const membersFromGroup = (
    await Member.find(
      { "groups.group": { $in: this.assignedGroups } },
      "_id"
    ).exec()
  ).map((x) => x._id.toString());

  // const members = await Member.find({
  //   _id: { $in: [...this.assignedMembers, membersFromGroup] },
  // }).exec();

  // proven to be without duplicate
  const memberIDs = this.assignedMembers.concat(membersFromGroup);

  // add new members
  const memberPromises = memberIDs.map(async (member) => {
    //check if member already have a clearance progress.
    const clearance = await ClearanceProgress.find({ member }).exec();
    if (clearance) {
    } else {
    }
  });
  await Promise.all(memberPromises);
};
ClearanceSchema.methods.apply = apply;

/**
 * Add a requirement in the clearance.
 * @param name - The name of the requirement.
 */
const addRequirement: ClearanceMethods["addRequirement"] = async function (
  this: ClearanceModel,
  name: string
) {
  const requirement = await Requirement.createRequirement({
    name,
    assignedMember: this.createdBy,
  });
  await requirement.save();
  this.requirements.push(requirement._id.toString());
  await this.save();
  return requirement;
};
RequirementSchema.methods.addRequirement = addRequirement;

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
RequirementSchema.methods.removeRequirement = removeRequirement;
