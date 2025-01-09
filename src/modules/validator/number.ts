import { DataValidationError } from '../../util/error';
import { type NumberValidateOpts } from './types';
import { ErrorMessage } from './util';

function numberValidator(val: any, options?: NumberValidateOpts): number {
  const num = Number(val);
  if (isNaN(num)) {
    throw new DataValidationError(ErrorMessage.invalidNumber);
  }

  let min = -999999999,
    max = 999999999;
  if (options) {
    options.min ? (min = options.min) : (min = -999999999);
    options.max ? (max = options.max) : (max = 999999999);
  }

  if (!Number.isFinite(num)) {
    throw new DataValidationError(ErrorMessage.numberMustBeFinite);
  }

  if (val < min || val > max) {
    throw new DataValidationError(
      ErrorMessage.numberOutOfRange + `(min:${min} max:${max})`
    );
  }

  return val as number;
}

export default numberValidator;
