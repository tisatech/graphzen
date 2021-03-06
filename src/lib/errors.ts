/**
 * Thrown when attempted ID access in the database was not found.
 */
export class IDNotFoundError extends Error {
  name = "IDNotFoundError";
}

/**
 * Thrown when attempted member ID access in the group was not found.
 */
export class MemberIDNotFoundError extends Error {
  name = "MemberIDNotFoundError";
}

/**
 * Thrown when attempted group ID access in the group was not found.
 */
export class GroupIDNotFoundError extends Error {
  name = "GroupIDNotFoundError";
}
/**
 * Thrown when attempted access parent of a root group.
 */
export class GroupHasNoParentError extends Error {
  name = "GroupHasNoParentError";
}

/**
 * Thrown when invalid action is done when member is not a shadow.
 */
export class MemberNotShadowError extends Error {
  name = "MemberNotShadowError";
}

/**
 * Thrown when invalid action is done when Member is a shadow.
 */
export class MemberShadowError extends Error {
  name = "MemberShadowError";
}
/**
 * Thrown when adding a duplicate Member in a group.
 */
export class UserAlreadyInGroup extends Error {
  name = "UserAlreadyInGroup";
}

/**
 * Thrown when trying to add a user that is not part of the root group.
 */
export class UserNotInRoot extends Error {
  name = "UserNotInRoot";
}

/**
 * Thrown when assigning a duplicate clearance.
 */
export class ClearanceAlreadyAssignedError extends Error {
  name = "ClearanceAlreadyAssignedError";
}
/**
 * Thrown when removing nonexistent member in clearance.
 */
export class ClearanceNotAssignedError extends Error {
  name = "ClearanceNotAssignedError";
}

/**
 * Thrown when setting privacy of non-page approval.
 */
export class ItemTypeNotPageError extends Error {
  name = "ItemTypeNotPageError";
}

/**
 * Thrown when item is not found when accessing inside requirements.
 */
export class ItemNotFoundError extends Error {
  name = "ItemNotFoundError";
}

/**
 * Thrown when arrangement input is invalid.
 */
export class ItemArrangementInvalid extends Error {
  name = "ItemArrangementInvalid";
}

/**
 * Thrown when requirement is not found when accessing inside clearance.
 */
export class RequirementNotFoundError extends Error {
  name = "RequirementNotFoundError";
}

/**
 * Thrown when item progress is not found when accessing inside requirement progress.
 */
export class ItemProgressNotFoundError extends Error {
  name = "ItemProgressNotFoundError";
}

/**
 * Thrown when requirement progress is not found when accessing inside clearance progress.
 */
export class RequirementProgressNotFoundError extends Error {
  name = "RequirementProgressNotFoundError";
}

/**
 * Thrown when clearance progress is not found when accessing inside clearance progress.
 */
export class ClearanceProgressNotFoundError extends Error {
  name = "ClearanceProgressNotFoundError";
}

/**
 * Thrown when member trying to be removed is part of a group.
 */
export class MemberPartOfGroupError extends Error {
  name = "MemberPartOfGroupError";
}

/**
 * Thrown when group is being removed from clearance.
 */
export class GroupNotAssignedInClearanceError extends Error {
  name = "GroupNotAssignedInClearanceError";
}
