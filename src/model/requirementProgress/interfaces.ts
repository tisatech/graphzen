import {
  RequirementProgressSchema,
  RequirementProgressSchemaPopulated,
} from "./schema";
import { RequirementProgressStatics } from "./statics";
import { Document, Model } from "mongoose";
import { RequirementProgressMethods } from "./methods";

export interface RequirementProgressModel
  extends RequirementProgressSchema,
    RequirementProgressMethods,
    Document {}
export interface RequirementProgressModelPopulated
  extends RequirementProgressSchemaPopulated,
    Document {}
export interface RequirementProgressEntity
  extends Model<RequirementProgressModel>,
    RequirementProgressStatics {}
