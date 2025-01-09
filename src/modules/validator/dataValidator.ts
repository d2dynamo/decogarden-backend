import type { ControllerState } from '../../controllers/types';
import type { ExpectType, ValidatorTypes, ValidatorOptions } from './types';
import numberValidator from './number';
import stringValidator from './string';
import arrayValidator from './array';
import booleanValidator from './boolean';
import objectValidator from './object';
import sortValidator from './sort';
import emailValidator from './email';
import { ErrorMessage } from './util';
import { DataValidationError } from '../../util/error';
import phoneNumberValidator from './phoneNumber';

/**
 * @param {ControllerState} ctrlState - ControllerState to store errors.
 * @method validate - Validate data.
 * @param {any} val - Data to validate.
 * @param {string} fieldName - Field name to store errors.
 * @param {ExpectType} expect - Expected data type.
 * @param {ValidatorOptions<ET>} options - Validation options.
 * @returns {Promise<returnType<ET> | false>} - Returns validated data or false.
 * TODO - Recursive object validation.
 */
class DataValidator {
  public ctrlState: ControllerState;

  constructor(ctrlState: ControllerState) {
    this.ctrlState = ctrlState;
  }

  async check<ET extends ExpectType>(
    val: any,
    fieldName: string,
    expect: ET,
    options?: ValidatorOptions<ET>
  ): Promise<ValidatorTypes[ET] | false> {
    if (val === null || val === undefined) {
      this.ctrlState.dataErrors[fieldName] = ErrorMessage.noInput;

      if (options?.required) {
        this.ctrlState.dataErrors[fieldName] = ErrorMessage.missingRequired;
        this.ctrlState.failMsg = ErrorMessage.missingRequired;
      }

      return false;
    }

    let result: ValidatorTypes[ET] | false = false;

    try {
      switch (expect) {
        case 'number':
          result = numberValidator(val, options) as ValidatorTypes[ET];
          break;
        case 'string':
          result = stringValidator(val, options) as ValidatorTypes[ET];
          break;
        case 'array':
          result = arrayValidator(val, options) as ValidatorTypes[ET];
          break;
        case 'boolean':
          result = booleanValidator(val) as ValidatorTypes[ET];
          break;
        case 'object':
          result = objectValidator(val, options) as ValidatorTypes[ET];
          break;
        case 'phoneNumber':
          result = phoneNumberValidator(val, options) as ValidatorTypes[ET];
          break;
        case 'sort':
          const sortResult = sortValidator(val, options);

          if (sortResult.errors) {
            this.ctrlState.dataErrors[fieldName] = {};
            for (const key in sortResult.errors) {
              this.ctrlState.dataErrors[fieldName][key] =
                sortResult.errors[key];
            }
          }

          result = sortResult.validSort as ValidatorTypes[ET];
          break;

        case 'email':
          result = emailValidator(val, options) as ValidatorTypes[ET];
          break;

        default:
          return false;
      }

      return result;
    } catch (err) {
      if (err instanceof DataValidationError) {
        this.ctrlState.dataErrors[fieldName] = err.message;
        if (options?.required) {
          this.ctrlState.failMsg = err.message;
        }
        return false;
      }
    }

    return false;
  }
}

export default DataValidator;
