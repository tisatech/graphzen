import { Model, Document } from "mongoose";
import { RequirementProgressSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { RequirementProgressMethods } from "./methods";
import { ItemProgress } from "../itemProgress";

interface RequirementProgressModel
  extends RequirementProgressSchema,
    Document,
    RequirementProgressMethods {}
interface RequirementProgressEntity
  extends RequirementProgressStatics,
    Model<RequirementProgressModel> {}

export interface RequirementProgressStatics {
  createRequirementProgress: (
    payload: NewRequirementProgressPayload
  ) => Promise<RequirementProgressModel>;
  getRequirementProgress: (_id: string) => Promise<RequirementProgressModel>;
  deleteRequirementProgress: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new RequirementProgress
 */
export interface NewRequirementProgressPayload {
  member: string;
  parent: string;
  definition: string;
}

/**
 * Create a new RequirementProgress
 * @return The nelwy created RequirementProgress.
 */
async function createRequirementProgress(
  this: RequirementProgressEntity,
  payload: NewRequirementProgressPayload
) {
  const requirementProgress = new this();
  const { member, parent, definition } = payload;
  requirementProgress.member = member;
  requirementProgress.parent = parent;
  requirementProgress.definition = definition;
  requirementProgress.status = "ACTIVE";
  return await requirementProgress.save();
}
RequirementProgressSchema.statics.createRequirementProgress = createRequirementProgress;

/**
 * Get RequirementProgress
 * @param _id - ID of the RequirementProgress.
 *
 * @return The requested RequirementProgress.
 * @throws IDNotFoundError
 */
async function getRequirementProgress(
  this: RequirementProgressEntity,
  _id: string
) {
  const requirementProgress = await this.findById(_id).exec();
  if (!requirementProgress)
    throw new IDNotFoundError("Cannot get requirementProgress.");
  return requirementProgress;
}
RequirementProgressSchema.statics.getRequirementProgress = getRequirementProgress;

/**
 * Delete a RequirementProgress.
 * @param _id - ID of the RequirementProgress.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteRequirementProgress(
  this: RequirementProgressEntity,
  _id: string
) {
  const requirementProgress = await this.findById(_id).exec();
  if (!requirementProgress)
    throw new IDNotFoundError("Cannot delete requirementProgress.");
  // Delete children.
  const promises = requirementProgress.items.map(async (itemID) => {
    await ItemProgress.deleteItemProgress(itemID);
  });
  await Promise.all(promises);
  await requirementProgress.remove();
}
RequirementProgressSchema.statics.deleteRequirementProgress = deleteRequirementProgress;
