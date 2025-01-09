import { DataValidationError } from '../../util/error';
import { ErrorMessage } from './util';

function booleanValidator(val: any): boolean | string {
  if (val === 'true' || val === 1) {
    return true;
  }

  if (val === 'false' || val === 0) {
    return false;
  }

  if (val !== undefined && typeof val !== 'boolean') {
    throw new DataValidationError(ErrorMessage.expectedBoolean);
  }

  return val;
}

export default booleanValidator;
