import { Model, Document } from "mongoose";
import { RequirementSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { RequirementMethods } from "./methods";
import { Item } from "../items";
import { RequirementProgress } from "../requirementProgress";

interface RequirementModel
  extends RequirementSchema,
    Document,
    RequirementMethods {}
interface RequirementEntity
  extends RequirementStatics,
    Model<RequirementModel> {}

export interface RequirementStatics {
  createRequirement: (
    payload: NewRequirementPayload
  ) => Promise<RequirementModel>;
  getRequirement: (_id: string) => Promise<RequirementModel>;
  updateRequirement: (
    _id: string,
    payload: UpdateRequirementPayload
  ) => Promise<void>;
  deleteRequirement: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new Requirement
 */
export interface NewRequirementPayload {
  name: RequirementModel["name"];
  assignedMember: RequirementModel["assignedMember"];
}
/**
 * Interface payload for updating Requirement
 */
interface UpdateRequirementPayload {
  name: RequirementModel["name"];
}

/**
 * Create a new Requirement
 * @return The nelwy created Requirement.
 */
async function createRequirement(
  this: RequirementEntity,
  payload: NewRequirementPayload
) {
  const requirement = new this();
  const { name, assignedMember } = payload;
  requirement.name = name;
  requirement.assignedMember = assignedMember;
  await requirement.save();
  return requirement;
}
RequirementSchema.statics.createRequirement = createRequirement;

/**
 * Get Requirement
 * @param _id - ID of the Requirement.
 *
 * @return The requested Requirement.
 * @throws IDNotFoundError
 */
async function getRequirement(this: RequirementEntity, _id: string) {
  const requirement = await this.findById(_id).exec();
  if (!requirement) throw new IDNotFoundError("Cannot get requirement.");
  return requirement;
}
RequirementSchema.statics.getRequirement = getRequirement;

/**
 * Update a Requirement
 * @param _id - ID of the Requirement.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function updateRequirement(
  this: RequirementEntity,
  _id: string,
  payload: UpdateRequirementPayload
) {
  const requirement = await this.findById(_id).exec();
  if (!requirement) throw new IDNotFoundError("Cannot update requirement.");
  const { name } = payload;
  requirement.name = name;
  await requirement.save();
}
RequirementSchema.statics.updateRequirement = updateRequirement;

/**
 * Delete an Requirement.
 * @param _id - ID of the Requirement.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteRequirement(this: RequirementEntity, _id: string) {
  const requirement = await this.findById(_id).exec();
  if (!requirement) throw new IDNotFoundError("Cannot delete requirement.");

  const { items } = requirement;
  const promises = items.map(async (itemID) => {
    await Item.deleteItem(itemID);
  });
  await Promise.all(promises);
  await RequirementProgress.deleteMany({
    definition: requirement._id.toString(),
  }).exec();
  await requirement.remove();
}
RequirementSchema.statics.deleteRequirement = deleteRequirement;
