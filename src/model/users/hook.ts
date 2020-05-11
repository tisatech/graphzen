import bcrypt from "bcrypt";
import { UserSchema } from "./schema";
import { UserModel } from "./interfaces";

/** @ignore */
const SALT_WORK_FACTOR = 10;

UserSchema.pre("save", function (this: UserModel, next) {
  if (!this.isModified("password")) return next();
  bcrypt.genSalt(SALT_WORK_FACTOR, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});
