import {
  ClearanceProgressSchema,
  ClearanceProgressSchemaPopulated,
} from "./schema";
import { ClearanceProgressStatics } from "./statics";
import { Document, Model } from "mongoose";
import { ClearanceProgressMethods } from "./methods";

export interface ClearanceProgressModel
  extends ClearanceProgressSchema,
    ClearanceProgressMethods,
    Document {}
export interface ClearanceProgressModelPopulated
  extends ClearanceProgressSchemaPopulated,
    Document {}
export interface ClearanceProgressEntity
  extends Model<ClearanceProgressModel>,
    ClearanceProgressStatics {}
