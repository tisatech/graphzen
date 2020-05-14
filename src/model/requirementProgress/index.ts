import { model, Model } from "mongoose";
import { RequirementProgressSchema } from "./schema";
import {
  RequirementProgressEntity,
  RequirementProgressModel,
} from "./interfaces";
import { RequirementProgressStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const RequirementProgress: RequirementProgressEntity = model<
  RequirementProgressModel,
  RequirementProgressStatics & Model<RequirementProgressModel>
>("RequirementProgress", RequirementProgressSchema);
export { RequirementProgressModel } from "./interfaces";
