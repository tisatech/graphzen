/**
 * @packageDocumentation
 * @module Group
 */

import { model, Model } from "mongoose";
import { GroupSchema } from "./schema";
import { GroupEntity, GroupModel } from "./interfaces";
import { GroupStatics } from "./statics";

import "./hook";
import "./statics";
import "./methods";

/**
 * The mongoose model for the Group.
 * @category Group
 */
export const Group: GroupEntity = model<
  GroupModel,
  GroupStatics & Model<GroupModel>
>("Group", GroupSchema);
export { GroupModel } from "./interfaces";
