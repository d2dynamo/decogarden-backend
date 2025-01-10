import type { Request, Response } from 'express';
import type {
  ErrorsDesc,
  ExpectType,
  ValidateOptions,
  ValidatorOptions,
} from '../modules/validator/types';

type ExpectParams<
  ET extends ExpectType,
  VO extends ValidatorOptions<ExpectType>
> = {
  [key: string]: {
    type: ET;
    options?: VO;
  };
};

interface ILocals {
  error: boolean;
  code: number;
  message: string;
  payload?: object;
}

/**
 * Controller class options
 * @param name - Controller name
 * @param {PermissionsEnum} validPermissions - Permissions required to access the controller. Empty array makes admin permission.
 * @param errorLevel - Error level
 */
interface IControllerOptions {
  name?: string;
  validPermissions?: string | string[];
  errorLevel?: LogLevel;
}

type ControllerState = {
  dataErrors: ErrorsDesc;
  failMsg: string | false;
};

export { ControllerState, ILocals, IControllerOptions, ExpectParams };
