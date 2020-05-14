import {
  RequirementProgressModel,
  RequirementProgressModelPopulated,
} from "./interfaces";
import { RequirementProgressSchema } from "./schema";
import { StatusType } from "../itemProgress/schema";
import { ItemProgressNotFoundError } from "../../lib/errors";
import { ClearanceProgress } from "../clearanceProgress";

export interface RequirementProgressMethods {
  getStatus(): RequirementProgressModel["status"];
  updateStatus(itemID: string, status: keyof StatusType): Promise<void>;
}

/**
 * Returns the status of the requirement. This also updates the state of the requirement.
 */
const getStatus: RequirementProgressMethods["getStatus"] = function (
  this: RequirementProgressModel
) {
  return this.status;
};
RequirementProgressSchema.methods.getStatus = getStatus;

/**
 * Updates the state of the requirement progress from the changes in its items.
 * @param itemID - The ID of the item.
 * @param status - The new status of the item.
 */
const updateStatus: RequirementProgressMethods["updateStatus"] = async function (
  this: RequirementProgressModel,
  itemID: string,
  status: keyof StatusType
) {
  const itemIndex = this.items.indexOf(itemID);
  if (itemIndex == -1)
    throw new ItemProgressNotFoundError("Can not update status.");

  // Process done array.
  if (status != "CLEARED") {
    const doneIndex = this.done.indexOf(itemID);
    if (doneIndex != -1) this.done.splice(doneIndex, 1);
  } else {
    const doneIndex = this.done.indexOf(itemID);
    if (doneIndex == -1) this.done.push(itemID);
  }

  // Process new status
  const items: RequirementProgressModelPopulated["items"] = (
    await this.populate("items").execPopulate()
  ).items as any;

  status = "CLEARED";
  for (let item of items) {
    const itemStatus = item.getStatus();
    if (itemStatus != "CLEARED") {
      status = itemStatus;
      break;
    }
  }
  this.status = status;
  await this.save();
  const clearanceProgress = await ClearanceProgress.getClearanceProgress(
    this.parent.toString()
  );
  await clearanceProgress.updateStatus(this._id.toString(), status);
};
RequirementProgressSchema.methods.updateStatus = updateStatus;
