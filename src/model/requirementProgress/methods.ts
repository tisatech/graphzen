import { RequirementProgressModel } from "./interfaces";
import { RequirementProgressSchema } from "./schema";
import { StatusType } from "../itemProgress/schema";
import { ItemProgressNotFoundError } from "../../lib/errors";
import { ClearanceProgress } from "../clearanceProgress";
import { ItemProgressModel } from "..";
import { ItemProgress } from "../itemProgress";

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
 * @param itemProgressID - The ID of the item.
 * @param status - The new status of the item.
 */
const updateStatus: RequirementProgressMethods["updateStatus"] = async function (
  this: RequirementProgressModel,
  itemProgressID: string,
  status: keyof StatusType
) {
  const itemIndex = this.items.map((x) => x.toString()).indexOf(itemProgressID);
  if (itemIndex == -1)
    throw new ItemProgressNotFoundError("Can not update status.");

  // Process done array.
  if (status != "CLEARED") {
    const doneIndex = this.done.indexOf(itemProgressID);
    if (doneIndex != -1) this.done.splice(doneIndex, 1);
  } else {
    const doneIndex = this.done.indexOf(itemProgressID);
    if (doneIndex == -1) this.done.push(itemProgressID);
  }

  // Process new status
  const items: ItemProgressModel[] = await ItemProgress.find({
    _id: { $in: this.items },
  }).exec();

  status = "CLEARED";
  for (const item of items) {
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
