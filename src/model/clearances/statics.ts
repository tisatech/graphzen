import { ClearanceSchema } from "./schema";
import { IDNotFoundError } from "../../lib/errors";
import { ClearanceModel } from ".";
import { UserModel } from "../users";
import { ClearanceEntity } from "./interfaces";
import { Requirement } from "../requirements";
import { ClearanceProgress } from "../clearanceProgress";

export interface ClearanceStatics {
  createClearance: (payload: NewClearancePayload) => Promise<ClearanceModel>;
  getClearance: (_id: string) => Promise<ClearanceModel>;
  updateClearance: (
    _id: string,
    payload: UpdateClearancePayload
  ) => Promise<void>;
  deleteClearance: (_id: string) => Promise<void>;
}

/**
 * Interface payload for creating new Clearance
 */
export interface NewClearancePayload {
  /** The title of the clearance. */
  name: ClearanceSchema["name"];
  /** The description of the clearance. */
  description: ClearanceSchema["description"];
  /** The group where the clearance is created. */
  scope_group: ClearanceSchema["scope_group"];
  /** The user created the clearance. */
  createdBy: UserModel["_id"];
}
/**
 * Interface payload for updating Clearance
 */
interface UpdateClearancePayload {
  /** The title of the clearance. */
  name: ClearanceSchema["name"];
  /** The description of the clearance. */
  description: ClearanceSchema["description"];
}

/**
 * Create a new Clearance
 * @return The nelwy created Clearance.
 */
const createClearance: ClearanceStatics["createClearance"] = async function (
  this: ClearanceEntity,
  payload: NewClearancePayload
) {
  const clearance = new this();
  const { name, description, scope_group, createdBy } = payload;
  clearance.name = name;
  clearance.description = description;
  clearance.scope_group = scope_group;
  clearance.createdBy = createdBy;
  clearance.isModifiedClearance = false;
  return await clearance.save();
};
ClearanceSchema.statics.createClearance = createClearance;

/**
 * Get Clearance
 * @param _id - ID of the Clearance.
 * @return The requested Clearance.
 * @throws IDNotFoundError
 */
const getClearance: ClearanceStatics["getClearance"] = async function (
  this: ClearanceEntity,
  _id: string
) {
  const clearance = await this.findById(_id).exec();
  if (!clearance) throw new IDNotFoundError("Cannot get clearance.");
  return clearance;
};
ClearanceSchema.statics.getClearance = getClearance;

/**
 * Update a Clearance
 * @param _id - ID of the Clearance.
 * @param payload - The update payload.
 * @throws IDNotFoundError
 */
const updateClearance: ClearanceStatics["updateClearance"] = async function (
  this: ClearanceEntity,
  _id: string,
  payload: UpdateClearancePayload
) {
  const clearance = await this.findById(_id).exec();
  if (!clearance) throw new IDNotFoundError("Cannot update Clearance.");

  const { name, description } = payload;
  clearance.name = name;
  clearance.description = description;
  await clearance.save();
};
ClearanceSchema.statics.updateClearance = updateClearance;

/**
 * Deletes a clearance group and their corresponding requirements and progress.
 * @param _id - ID of the Clearance.
 *
 * @throws IDNotFoundError
 */
const deleteClearance: ClearanceStatics["deleteClearance"] = async function (
  this: ClearanceEntity,
  _id: string
) {
  const clearance = await this.findById(_id).exec();
  if (!clearance) throw new IDNotFoundError("Cannot delete clearance.");

  const promises = clearance.requirements.map(async (requirementID) => {
    await Requirement.deleteRequirement(requirementID.toString());
  });
  await Promise.all(promises);
  await ClearanceProgress.deleteMany({
    definition: clearance._id.toString(),
  }).exec();
  await clearance.remove();
};
ClearanceSchema.statics.deleteClearance = deleteClearance;
