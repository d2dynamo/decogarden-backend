import { DataValidationError } from '../../util/error';
import { type PhoneNumberValidateOpts } from './types';
import { ErrorMessage } from './util';

function phoneNumberValidator(
  val: any,
  options?: PhoneNumberValidateOpts
): string {
  if (typeof val !== 'string') {
    throw new DataValidationError(ErrorMessage.expectedString);
  }

  val.replace(/[\s()-]/g, '');

  if (options?.international && !/^\+?[1-9]\d{1,14}$/.test(val)) {
    throw new DataValidationError(ErrorMessage.internationalPhoneNumberInvalid);
  }

  if (!/^\+?\d{3,15}$/.test(val)) {
    throw new DataValidationError(ErrorMessage.phoneNumberInvalid);
  }

  return val as string;
}

export default phoneNumberValidator;
