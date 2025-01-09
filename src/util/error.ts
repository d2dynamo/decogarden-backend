/**
 * Primary usage is to throw this when module detects user error so that controller can catch instanceof UserError and return 400 to client.
 * @param message string
 * @param code number
 *
 */
class UserError extends Error {
  code: number;

  constructor(message: string, code: number = 400) {
    super(message);
    this.code = code;
  }
}

class DataValidationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export { UserError, DataValidationError };
