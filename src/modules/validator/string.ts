import { DataValidationError } from '../../util/error';
import { type StringValidateOpts } from './types';
import { ErrorMessage } from './util';

export default function stringValidator(
  val: any,
  options?: StringValidateOpts
): string {
  const isString = typeof val === 'string';
  if (!isString) {
    throw new DataValidationError(ErrorMessage.expectedString);
  }

  let minLength = 1,
    maxLength = 999;
  if (options) {
    options.minLength ? (minLength = options.minLength) : (minLength = 0);
    options.maxLength
      ? (maxLength = options.maxLength)
      : (maxLength = 999999999);
  }

  if (val.length < minLength || val.length > maxLength) {
    throw new DataValidationError(
      ErrorMessage.stringOutOfRange + `(min:${minLength} max:${maxLength})`
    );
  }

  return val;
}
