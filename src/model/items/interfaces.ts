import { ItemSchema, ItemSchemaPopulated } from "./schema";
import { ItemStatics } from "./statics";
import { Document, Model } from "mongoose";
import { ItemMethods } from "./methods";

export interface ItemModel extends ItemSchema, ItemMethods, Document {}
export interface ItemModelPopulated extends ItemSchemaPopulated, Document {}
export interface ItemEntity extends Model<ItemModel>, ItemStatics {}
