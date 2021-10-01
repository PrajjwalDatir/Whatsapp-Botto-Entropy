/**
 * Checks if the given value is truthy.
 * @param value
 */
export const isTruthy = <T>(value: T | null | undefined): value is T => {
    return value !== null && value !== undefined
}
