import { model, Model } from "mongoose";
import { ClearanceProgressSchema } from "./schema";
import { ClearanceProgressEntity, ClearanceProgressModel } from "./interfaces";
import { ClearanceProgressStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const ClearanceProgress: ClearanceProgressEntity = model<
  ClearanceProgressModel,
  ClearanceProgressStatics & Model<ClearanceProgressModel>
>("ClearanceProgress", ClearanceProgressSchema);
export { ClearanceProgressModel } from "./interfaces";
