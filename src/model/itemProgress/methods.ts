import { ItemProgressSchema } from "./schema";
import { ItemProgressModel } from ".";
import { RequirementProgress } from "../requirementProgress";

export interface ItemProgressMethods {
  setStatus(status: ItemProgressModel["status"]): Promise<void>;
  getStatus(): ItemProgressModel["status"];
}

/**
 * Set status of the progress item and add it to done of parent.
 * @param status The status of the item progress.
 */
const setStatus: ItemProgressMethods["setStatus"] = async function (
  this: ItemProgressModel,
  status: ItemProgressModel["status"]
) {
  this.status = status;
  const requirementProgress = await RequirementProgress.getRequirementProgress(
    this.parent
  );
  await this.save();
  await requirementProgress.updateStatus(this._id.toString(), status);
};
ItemProgressSchema.methods.setStatus = setStatus;

/**
 * Get the status of the progress item.
 * @returns the status.
 */
const getStatus: ItemProgressMethods["getStatus"] = function (
  this: ItemProgressModel
) {
  return this.status;
};
ItemProgressSchema.methods.getStatus = getStatus;
