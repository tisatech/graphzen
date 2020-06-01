import { ClearanceSchema, ClearanceSchemaPopulated } from "./schema";
import { ClearanceStatics } from "./statics";
import { Document, Model } from "mongoose";
import { ClearanceMethods } from "./methods";

export interface ClearanceModel
  extends ClearanceSchema,
    ClearanceMethods,
    Document {}
export interface ClearanceModelPopulated
  extends ClearanceSchemaPopulated,
    Document {}
export interface ClearanceEntity
  extends Model<ClearanceModel>,
    ClearanceStatics {}
