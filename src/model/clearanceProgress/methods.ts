import { ClearanceProgressModel } from "./interfaces";
import { ClearanceProgressSchema } from "./schema";
import { StatusType } from "./schema";
import { RequirementProgressNotFoundError } from "../../lib/errors";
import {
  RequirementProgress,
  RequirementProgressModel,
} from "../requirementProgress";

export interface ClearanceProgressMethods {
  getStatus(): Promise<ClearanceProgressModel["status"]>;
  updateStatus(requirementID: string, status: keyof StatusType): Promise<void>;
}

/**
 * Returns the status of the requirement.
 */
const getStatus: ClearanceProgressModel["getStatus"] = async function (
  this: ClearanceProgressModel
) {
  return this.status;
};
ClearanceProgressSchema.methods.getStatus = getStatus;

/**
 * Update the clearance progress state from the requirement status.
 * @param requirementID ID of the requirement.
 * @param status The new status update.
 */
const updateStatus: ClearanceProgressMethods["updateStatus"] = async function (
  this: ClearanceProgressModel,
  requirementID: string,
  status: keyof StatusType
) {
  const requirementIndex = this.requirements
    .map((x) => x.toString())
    .indexOf(requirementID);
  if (requirementIndex == -1)
    throw new RequirementProgressNotFoundError("Can not update status.");

  // Process done array.
  if (status != "CLEARED") {
    const doneIndex = this.done.map((x) => x.toString()).indexOf(requirementID);
    if (doneIndex != -1) this.done.splice(doneIndex, 1);
  } else {
    const doneIndex = this.done.map((x) => x.toString()).indexOf(requirementID);
    if (doneIndex == -1) this.done.push(requirementID);
  }

  // Process new status
  const requirements: RequirementProgressModel[] = await RequirementProgress.find(
    { _id: { $in: this.requirements } }
  ).exec();

  status = "CLEARED";
  for (const requirement of requirements) {
    const requirementStatus = requirement.getStatus();
    if (requirementStatus != "CLEARED" && status == "CLEARED")
      status = requirementStatus;
    else if (requirementStatus == "ACTIVE" && status == "PENDING")
      status = requirementStatus;
  }
  this.status = status;
  await this.save();
};
ClearanceProgressSchema.methods.updateStatus = updateStatus;
