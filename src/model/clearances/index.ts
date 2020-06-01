import { model, Model } from "mongoose";
import { ClearanceSchema } from "./schema";
import { ClearanceEntity, ClearanceModel } from "./interfaces";
import { ClearanceStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const Clearance: ClearanceEntity = model<
  ClearanceModel,
  ClearanceStatics & Model<ClearanceModel>
>("Clearance", ClearanceSchema);
export { ClearanceModel } from "./interfaces";
