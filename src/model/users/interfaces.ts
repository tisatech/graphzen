import {UserSchema, UserSchemaPopulated} from './schema';
import {UserStatics} from './statics';
import {Document, Model} from 'mongoose';
import {UserMethods} from './methods';

/**
 * The User model interface.
 * @category User
 */
export interface UserModel extends UserSchema, Document, UserMethods {}

/**
 * @ignore
 * The User model interface.
 */
export interface UserModelPopulated extends UserSchemaPopulated, Document {}

/**
 * @ignore
 * The mongoose schena interface for the User.
 */
export interface UserEntity extends UserStatics, Model<UserModel> {}
