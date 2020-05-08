import { Schema } from "mongoose";
import { GroupModel } from "../groups";

export const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  owned_groups: [{ type: Schema.Types.ObjectId, ref: "Group" }],
});

interface BaseSchema {
  name: string;
  email: string;
  password: string;
}

export interface UserSchema extends BaseSchema {
  owned_groups: string[];
}

export interface UserSchemaPopulated extends BaseSchema {
  owned_groups: GroupModel[];
}
