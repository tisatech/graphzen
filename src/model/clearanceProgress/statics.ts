import { Model, Document } from "mongoose";
import { ClearanceProgressSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { ClearanceProgressMethods } from "./methods";
import { RequirementProgress } from "../requirementProgress";

interface ClearanceProgressModel
  extends ClearanceProgressSchema,
    Document,
    ClearanceProgressMethods {}
interface ClearanceProgressEntity
  extends ClearanceProgressStatics,
    Model<ClearanceProgressModel> {}

export interface ClearanceProgressStatics {
  createClearanceProgress: (
    payload: NewClearanceProgressPayload
  ) => Promise<ClearanceProgressModel>;
  getClearanceProgress: (_id: string) => Promise<ClearanceProgressModel>;
  deleteClearanceProgress: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new ClearanceProgress
 */
export interface NewClearanceProgressPayload {
  member: string;
  definition: string;
}

/**
 * Create a new ClearanceProgress
 * @return The nelwy created ClearanceProgress.
 */
async function createClearanceProgress(
  this: ClearanceProgressEntity,
  payload: NewClearanceProgressPayload
) {
  const clearanceProgress = new this();
  const { member, definition } = payload;
  clearanceProgress.member = member;
  clearanceProgress.definition = definition;
  clearanceProgress.status = "ACTIVE";
  return await clearanceProgress.save();
}
ClearanceProgressSchema.statics.createClearanceProgress = createClearanceProgress;

/**
 * Get ClearanceProgress
 * @param _id - ID of the ClearanceProgress.
 *
 * @return The requested ClearanceProgress.
 * @throws IDNotFoundError
 */
async function getClearanceProgress(
  this: ClearanceProgressEntity,
  _id: string
) {
  const clearanceProgress = await this.findById(_id).exec();
  if (!clearanceProgress)
    throw new IDNotFoundError("Cannot get clearanceProgress.");
  return clearanceProgress;
}
ClearanceProgressSchema.statics.getClearanceProgress = getClearanceProgress;

/**
 * Delete a ClearanceProgress.
 * @param _id - ID of the ClearanceProgress.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteClearanceProgress(
  this: ClearanceProgressEntity,
  _id: string
) {
  const clearanceProgress = await this.findById(_id).exec();
  if (!clearanceProgress)
    throw new IDNotFoundError("Cannot delete clearanceProgress.");

  // Delete children.
  const promises = clearanceProgress.requirements.map(async (requirementID) => {
    await RequirementProgress.deleteRequirementProgress(requirementID);
  });
  await Promise.all(promises);
  await clearanceProgress.remove();
}
ClearanceProgressSchema.statics.deleteClearanceProgress = deleteClearanceProgress;
