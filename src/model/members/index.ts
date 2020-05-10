import { model, Model } from "mongoose";
import { MemberSchema } from "./schema";
import { MemberEntity, MemberModel } from "./interfaces";
import "./hook";
import "./statics";
import "./methods";
import { MemberStatics } from "./statics";
export const Member: MemberEntity = model<
  MemberModel,
  MemberStatics & Model<MemberModel>
>("Member", MemberSchema);
export { MemberModel } from "./interfaces";
