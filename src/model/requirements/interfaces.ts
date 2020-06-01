import { RequirementSchema, RequirementSchemaPopulated } from "./schema";
import { RequirementStatics } from "./statics";
import { Document, Model } from "mongoose";
import { RequirementMethods } from "./methods";

export interface RequirementModel
  extends RequirementSchema,
    RequirementMethods,
    Document {}
export interface RequirementModelPopulated
  extends RequirementSchemaPopulated,
    Document {}
export interface RequirementEntity
  extends Model<RequirementModel>,
    RequirementStatics {}
