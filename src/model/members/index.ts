import { model, Model } from "mongoose";
import { MemberSchema } from "./schema";
import { MemberEntity, MemberModel } from "./interfaces";
import { MemberStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

export const Member: MemberEntity = model<
  MemberModel,
  MemberStatics & Model<MemberModel>
>("Member", MemberSchema);
export { MemberModel } from "./interfaces";
