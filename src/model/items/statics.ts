import { Model, Document } from "mongoose";
import { ItemSchema } from "./schema";
import { IDNotFoundError, GroupIDNotFoundError } from "../../lib/errors";
import { ItemMethods } from "./methods";

interface ItemModel extends ItemSchema, Document, ItemMethods {}
interface ItemEntity extends ItemStatics, Model<ItemModel> {}

export interface ItemStatics {
  createItem: (payload: NewItemPayload) => Promise<ItemModel>;
  getItem: (_id: string) => Promise<ItemModel>;
  updateItem: (_id: string, payload: UpdateItemPayload) => Promise<void>;
  deleteItem: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new Item
 */
export interface NewItemPayload {
  name: ItemModel["name"];
  description: ItemModel["description"];
  assignedMember: ItemModel["assignedMember"];
}
/**
 * Interface payload for updating Item
 */
interface UpdateItemPayload {
  name: ItemModel["name"];
  description: ItemModel["description"];
}

/**
 * Create a new Item
 * @return The nelwy created Item.
 */
async function createItem(this: ItemEntity, payload: NewItemPayload) {
  const item = new this();
  const { name, description, assignedMember } = payload;

  item.name = name;
  item.description = description;
  item.approvalType = "STAFF";
  item.hasDeadline = false;
  item.assignedMember = assignedMember;

  return await item.save();
}
ItemSchema.statics.createItem = createItem;

/**
 * Get Item
 * @param _id - ID of the Item.
 *
 * @return The requested Item.
 * @throws IDNotFoundError
 */
async function getItem(this: ItemEntity, _id: string) {
  const item = await this.findById(_id).exec();
  if (!item) throw new IDNotFoundError("Cannot get item.");
  return item;
}
ItemSchema.statics.getItem = getItem;

/**
 * Update a Item
 * @param _id - ID of the Item.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function updateItem(
  this: ItemEntity,
  _id: string,
  payload: UpdateItemPayload
) {
  const item = await this.findById(_id).exec();
  if (!item) throw new IDNotFoundError("Cannot update item.");
  const { name, description } = payload;
  item.name = name;
  item.description = description;
  await item.save();
}
ItemSchema.statics.updateItem = updateItem;

/**
 * Delete an item.
 * @param _id - ID of the Item.
 *
 * @throws IDNotFoundError, GroupIDNotFoundError
 */
async function deleteItem(this: ItemEntity, _id: string) {
  const item = await this.findById(_id).exec();
  if (!item) throw new IDNotFoundError("Cannot delete item.");
  await item.remove();
}
ItemSchema.statics.deleteItem = deleteItem;
