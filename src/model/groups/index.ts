import { model, Model } from "mongoose";
import { GroupSchema } from "./schema";
import { GroupEntity, GroupModel } from "./interfaces";
import "./hook";
import { GroupStatics } from "./statics";
export const Group: GroupEntity = model<
  GroupModel,
  GroupStatics & Model<GroupModel>
>("Group", GroupSchema);
export { GroupModel } from "./interfaces";
