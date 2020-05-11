import { Schema } from "mongoose";
import { UserModel } from "../users";
import { GroupModel } from "../groups";

export const MemberSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  scope_group: { type: Schema.Types.ObjectId, ref: "Group" },
  groups: [
    {
      nickname: String,
      customID: String,
      group: { type: Schema.Types.ObjectId, ref: "Group" },
    },
  ],

  isShadow: Boolean,
  isPublished: Boolean,
});

interface BaseSchema {
  isShadow: boolean;
  isPublished: boolean;
}

export interface MemberSchema extends BaseSchema {
  user?: string;
  scope_group: string;
  groups: Array<{
    nickname: string;
    customID: string;
    group: string;
  }>;
}

export interface MemberSchemaPopulated extends BaseSchema {
  user?: UserModel;
  scope_group: GroupModel;
  groups: Array<{
    nickname: string;
    customID: string;
    group: GroupModel;
  }>;
}
