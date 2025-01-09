import { DataValidationError } from '../../util/error';
import { type ArrayValidateOpts } from './types';
import { ErrorMessage } from './util';

function arrayValidator(val: any, options?: ArrayValidateOpts): any[] | string {
  const isArray = Array.isArray(val);
  if (!isArray) {
    throw new DataValidationError(ErrorMessage.expectedArray);
  }

  let minLength = 0,
    maxLength = 1000;
  if (options) {
    options.minLength ? (minLength = options.minLength) : (minLength = 0);
    options.maxLength ? (maxLength = options.maxLength) : (maxLength = 1000);
  }

  if (val.length < minLength || val.length > maxLength) {
    throw new DataValidationError(
      ErrorMessage.arrayOutOfRange + `(min:${minLength} max:${maxLength})`
    );
  }

  return val;
}

export default arrayValidator;
