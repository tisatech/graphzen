import { Model, Document } from "mongoose";
import { ItemProgressSchema } from "./schema";
import { IDNotFoundError, GroupIDNotFoundError } from "../../lib/errors";
import { ItemProgressMethods } from "./methods";

interface ItemProgressModel
  extends ItemProgressSchema,
    Document,
    ItemProgressMethods {}
interface ItemProgressEntity
  extends ItemProgressStatics,
    Model<ItemProgressModel> {}

export interface ItemProgressStatics {
  createItemProgress: (
    payload: NewItemProgressPayload
  ) => Promise<ItemProgressModel>;
  getItemProgress: (_id: string) => Promise<ItemProgressModel>;
  deleteItemProgress: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new ItemProgress
 */
export interface NewItemProgressPayload {
  member: ItemProgressModel["member"];
  parent: ItemProgressModel["parent"];
  definition: ItemProgressModel["definition"];
}

/**
 * Create a new ItemProgress
 * @return The nelwy created ItemProgress.
 */
async function createItemProgress(
  this: ItemProgressEntity,
  payload: NewItemProgressPayload
) {
  const itemProgress = new this();
  const { member, parent, definition } = payload;

  itemProgress.member = member;
  itemProgress.parent = parent;
  itemProgress.definition = definition;
  itemProgress.status = "ACTIVE";

  return await itemProgress.save();
}
ItemProgressSchema.statics.createItemProgress = createItemProgress;

/**
 * Get ItemProgress
 * @param _id - ID of the ItemProgress.
 *
 * @return The requested ItemProgress.
 * @throws IDNotFoundError
 */
async function getItemProgress(this: ItemProgressEntity, _id: string) {
  const itemProgress = await this.findById(_id).exec();
  if (!itemProgress) throw new IDNotFoundError("Cannot get itemProgress.");
  return itemProgress;
}
ItemProgressSchema.statics.getItemProgress = getItemProgress;

/**
 * Delete an itemProgress.
 * @param _id - ID of the ItemProgress.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteItemProgress(this: ItemProgressEntity, _id: string) {
  const itemProgress = await this.findById(_id).exec();
  if (!itemProgress) throw new IDNotFoundError("Cannot delete itemProgress.");
  await itemProgress.remove();
}
ItemProgressSchema.statics.deleteItemProgress = deleteItemProgress;
