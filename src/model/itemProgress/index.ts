import { model, Model } from "mongoose";
import { ItemProgressSchema } from "./schema";
import { ItemProgressEntity, ItemProgressModel } from "./interfaces";
import { ItemProgressStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const ItemProgress: ItemProgressEntity = model<
  ItemProgressModel,
  ItemProgressStatics & Model<ItemProgressModel>
>("ItemProgress", ItemProgressSchema);
export { ItemProgressModel } from "./interfaces";
