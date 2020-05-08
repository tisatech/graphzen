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
