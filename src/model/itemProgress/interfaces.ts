import { ItemProgressSchema, ItemProgressSchemaPopulated } from "./schema";
import { ItemProgressStatics } from "./statics";
import { Document, Model } from "mongoose";
import { ItemProgressMethods } from "./methods";

export interface ItemProgressModel
  extends ItemProgressSchema,
    ItemProgressMethods,
    Document {}
export interface ItemProgressModelPopulated
  extends ItemProgressSchemaPopulated,
    Document {}
export interface ItemProgressEntity
  extends Model<ItemProgressModel>,
    ItemProgressStatics {}
