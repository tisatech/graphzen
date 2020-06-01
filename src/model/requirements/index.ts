import { model, Model } from "mongoose";
import { RequirementSchema } from "./schema";
import { RequirementEntity, RequirementModel } from "./interfaces";
import { RequirementStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const Requirement: RequirementEntity = model<
  RequirementModel,
  RequirementStatics & Model<RequirementModel>
>("Requirement", RequirementSchema);
export { RequirementModel } from "./interfaces";
