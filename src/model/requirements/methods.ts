import { RequirementSchema } from "./schema";
import { Item, ItemModel } from "../items";
import { RequirementModel } from ".";
import { ItemNotFoundError, ItemArrangementInvalid } from "../../lib/errors";

export interface RequirementMethods {
  addItem(name: string, description: string): Promise<ItemModel>;
  removeItem(_id: string): Promise<void>;
  reorderItems(items: string[]): Promise<void>;
}

/**
 * Add item in the requirement.
 * @param name The name of the requirement.
 * @param description The description of the requirement.
 */
const addItem: RequirementMethods["addItem"] = async function (
  this: RequirementModel,
  name: string,
  description: string
) {
  const item = await Item.createItem({
    name,
    description,
    assignedMember: this.assignedMember,
  });
  this.items.push(item._id.toString());
  await this.save();
  return item;
};
RequirementSchema.methods.addItem = addItem;

/**
 * Remove item requirement.
 * @param _id ID of the requirement item.
 * @throws ItemNotFoundError
 */
const removeItem: RequirementMethods["removeItem"] = async function (
  this: RequirementModel,
  _id: string
) {
  const itemIndex = this.items.indexOf(_id);
  const itemID = this.items[itemIndex];

  if (itemIndex == -1)
    throw new ItemNotFoundError("Can not remove item in the requirement.");

  this.items.splice(itemIndex, 1);
  await this.save();
  await Item.deleteItem(itemID);
};
RequirementSchema.methods.removeItem = removeItem;

/**
 * Reorder items in the requirements.
 * @param items ID of the items in the new order.
 * @throws ItemArrangementInvalid
 */
const reorderItems: RequirementMethods["reorderItems"] = async function (
  this: RequirementModel,
  items: string[]
) {
  // check if all the items are present.
  const isSameLength = items.length == this.items.length;
  const isIDsPresent = this.items.every((x) => items.includes(x));
  const isValid = isSameLength && isIDsPresent;

  if (!isValid)
    throw new ItemArrangementInvalid(
      "Can not reorder items. Items are invalid."
    );

  this.items = items;
  await this.save();
};
RequirementSchema.methods.reorderItems = reorderItems;
