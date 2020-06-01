import { RequirementSchema } from "./schema";
import { Item, ItemModel } from "../items";
import { RequirementModel } from ".";
import {
  ItemNotFoundError,
  ItemArrangementInvalid,
  RequirementProgressNotFoundError,
} from "../../lib/errors";
import { ItemProgress } from "../itemProgress";
import {
  RequirementProgressModel,
  RequirementProgress,
} from "../requirementProgress";
import { Clearance } from "../clearances";

export interface RequirementMethods {
  addItem(name: string, description: string): Promise<ItemModel>;
  removeItem(_id: string): Promise<void>;
  reorderItems(items: string[]): Promise<void>;
  apply(): Promise<void>;

  getProgress(memberID: string): Promise<RequirementProgressModel>;
  applyNewItem(itemID: string): Promise<void>;
  applyRemoveItem(itemID: string): Promise<void>;
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
  const isIDsPresent = this.items.every((x) => items.includes(x.toString()));
  const isValid = isSameLength && isIDsPresent;
  if (!isValid)
    throw new ItemArrangementInvalid(
      "Can not reorder items. Items are invalid."
    );

  this.items = items;
  await this.save();
};
RequirementSchema.methods.reorderItems = reorderItems;

/**
 * Get the requirement progress of a member.
 * @param memberID - The ID of the member.
 */
const getProgress: RequirementMethods["getProgress"] = async function (
  this: RequirementModel,
  memberID: string
) {
  const requirementProgress = await RequirementProgress.findOne({
    definition: this._id.toString(),
    member: memberID,
  });

  if (!requirementProgress)
    throw new RequirementProgressNotFoundError(
      "Can not get requirement progress."
    );
  return requirementProgress;
};
RequirementSchema.methods.getProgress = getProgress;

/**
 * Create itemProgress for a new item.
 * @param item ID of the item in the new order.
 */
const applyNewItem: RequirementMethods["applyNewItem"] = async function (
  this: RequirementModel,
  itemID: string
) {
  const clearance = await Clearance.getClearance(this.clearance);
  const members = await clearance.getAllMembers();
  const promises = members.map(async (member) => {
    const requirementProgress = await this.getProgress(member);
    const itemProgress = await ItemProgress.createItemProgress({
      definition: itemID,
      parent: requirementProgress._id.toString(),
      member,
    });
    requirementProgress.items.push(itemProgress._id.toString());
    await requirementProgress.save();
  });
  await Promise.all(promises);
};
RequirementSchema.methods.applyNewItem = applyNewItem;

/**
 * Remove itemProgress for a removed item.
 * @param item ID of the item in the new order.
 */
const applyRemoveItem: RequirementMethods["applyRemoveItem"] = async function (
  this: RequirementModel,
  itemID: string
) {
  await ItemProgress.deleteMany({ definition: itemID }).exec();
  const clearance = await Clearance.getClearance(this.clearance);
  const members = await clearance.getAllMembers();
  const promises = members.map(async (member) => {
    const requirementProgress = await this.getProgress(member);
    requirementProgress.items = requirementProgress.items.filter(
      (x) => x.toString() != itemID
    );
    await requirementProgress.save();
  });
  await Promise.all(promises);
};
RequirementSchema.methods.applyRemoveItem = applyRemoveItem;
