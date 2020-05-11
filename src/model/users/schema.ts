import {Schema} from 'mongoose';
import {GroupModel} from '../groups';

/**
 * @ignore
 * Mongoose Schem for the user
 * @category User
 */
export const UserSchema = new Schema({
  name: String,
  email: String,
  password: String,
  owned_groups: [{type: Schema.Types.ObjectId, ref: 'Group'}],
});

/** *
 * Base schema for the User model.
 * @category User
 */
interface UserBaseSchema {
  /** Name of the user. */
  name: string;
  /** Email of the user. */
  email: string;
  /** Password of the user. */
  password: string;
}

/** *
 * User schema for the model.
 * @category User
 */
export interface UserSchema extends UserBaseSchema {
  /** The ID of the groups owned by the user. */
  owned_groups: string[];
}

/** *
 * Populated user schema for the model.
 * @category User
 */
export interface UserSchemaPopulated extends UserBaseSchema {
  /** The populated groups owned by the user. */
  owned_groups: GroupModel[];
}
