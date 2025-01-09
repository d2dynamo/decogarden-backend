import { DataValidationError } from '../../util/error';
import { type ObjectValidateOpts } from './types';
import { ErrorMessage } from './util';

/** TODO Recursive validation */
function objectValidator(val: any, options?: ObjectValidateOpts): object {
  const isObject = val !== null && typeof val === 'object';
  if (!isObject) {
    throw new DataValidationError(ErrorMessage.expectedObject);
  }

  let minProps = 1,
    maxProps = 1000;
  if (options) {
    options.minProps ? (minProps = options.minProps) : (minProps = 1);
    options.maxProps ? (maxProps = options.maxProps) : (maxProps = 1000);
  }

  if (maxProps > 1000) {
    maxProps = 1000;
  }

  let amountProps = 0;

  for (const key in val) {
    if (val.hasOwnProperty(key)) {
      amountProps++;
    }

    // Check max props here incase of excessive loop
    if (amountProps > maxProps || amountProps > 1000) {
      throw new DataValidationError(
        ErrorMessage.objectPropertyCountOutOfRange +
          `(min:${minProps} max:${maxProps})`
      );
    }
  }

  if (minProps !== undefined && amountProps < minProps) {
    throw new DataValidationError(
      ErrorMessage.objectPropertyCountOutOfRange +
        `(min:${minProps} max:${maxProps})`
    );
  }

  return val as object;
}

export default objectValidator;
