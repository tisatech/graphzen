import {
  ClearanceProgressModel,
  ClearanceProgressModelPopulated,
} from "./interfaces";
import { ClearanceProgressSchema } from "./schema";
import { StatusType } from "./schema";
import { RequirementProgressNotFoundError } from "../../lib/errors";

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
  if (this.done.length === this.requirements.length) return "CLEARED";

  const requirements: ClearanceProgressModelPopulated["requirements"] = (
    await this.populate("requirements").execPopulate()
  ).requirements as any;

  let status: "CLEARED" | "PENDING" | "ACTIVE" = "ACTIVE";
  for (let requirement of requirements) {
    const requirementStatus = await requirement.getStatus();
    if (requirementStatus == "PENDING" || requirementStatus == "ACTIVE") {
      status = requirementStatus;
      break;
    }
  }
  this.status = status;
  await this.save();
  return status;
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
  const requirementIndex = this.requirements.indexOf(requirementID);
  if (requirementIndex == -1)
    throw new RequirementProgressNotFoundError("Can not update status.");

  // Process done array.
  if (status != "CLEARED") {
    const doneIndex = this.done.indexOf(requirementID);
    if (doneIndex != -1) this.done.splice(doneIndex, 1);
  } else {
    const doneIndex = this.done.indexOf(requirementID);
    if (doneIndex == -1) this.done.push(requirementID);
  }

  // Process new status
  const requirements: ClearanceProgressModelPopulated["requirements"] = (
    await this.populate("requirements").execPopulate()
  ).requirements as any;

  status = "CLEARED";
  for (let requirement of requirements) {
    const requirementStatus = requirement.getStatus();
    if (requirementStatus != "CLEARED") {
      status = requirementStatus;
      break;
    }
  }
  this.status = status;
  await this.save();
};
ClearanceProgressSchema.methods.updateStatus = updateStatus;
