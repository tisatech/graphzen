/**
 * Thrown when attempted ID access in the database was not found.
 */
export class IDNotFoundError extends Error {}

/**
 * Thrown when attempted member ID access in the group was not found.
 */
export class MemberIDNotFoundError extends Error {}

/**
 * Thrown when attempted group ID access in the group was not found.
 */
export class GroupIDNotFoundError extends Error {}
/**
 * Thrown when attempted access parent of a root group.
 */
export class GroupHasNoParentError extends Error {}

/**
 * Thrown when invalid action is done when member is not a shadow.
 */
export class MemberNotShadowError extends Error {}

/**
 * Thrown when invalid action is done when Member is a shadow.
 */
export class MemberShadowError extends Error {}

/**
 * Thrown when trying to add a user that is not part of the root group.
 */
export class UserNotInRoot extends Error {}
