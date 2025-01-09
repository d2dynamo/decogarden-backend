import { DataValidationError } from '../../util/error';
import { type Email, type EmailValidateOpts } from './types';
import { ErrorMessage } from './util';

function emailValidator(val: any, options?: EmailValidateOpts): Email | string {
  const isString = typeof val === 'string';
  if (!isString) {
    throw new DataValidationError(ErrorMessage.expectedString);
  }

  if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val)) {
    throw new DataValidationError(ErrorMessage.emailInvalid);
  }

  return val as Email;
}

export default emailValidator;
