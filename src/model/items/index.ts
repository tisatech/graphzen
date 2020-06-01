import { model, Model } from "mongoose";
import { ItemSchema } from "./schema";
import { ItemEntity, ItemModel } from "./interfaces";
import { ItemStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const Item: ItemEntity = model<
  ItemModel,
  ItemStatics & Model<ItemModel>
>("Item", ItemSchema);
export { ItemModel } from "./interfaces";
