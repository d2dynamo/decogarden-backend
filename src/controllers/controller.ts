import DataValidator from '../modules/validator';
import type { Request, Response } from 'express';
import type {
  ExpectType,
  ValidatorTypes,
  ValidatorOptions,
} from '../modules/validator/types';
import type { ControllerState, IControllerOptions, ILocals } from './types';
import userHasPermission from '../modules/userPermissions/get';
import logger from '../modules/logger';
import { UserError } from '../util/error';
import type { LogLevel } from '../modules/logger/types';
import { PermissionsEnum } from '../global/interfaces/permissions';

class Controller {
  req: Request;
  res: Response;
  locals: ILocals;
  private _next: Function;
  private state: ControllerState;
  private name: string;
  private errorLevel: LogLevel;
  private validPermissions?: string[];

  private logic: Function;

  constructor(
    req: Request,
    res: Response,
    next: Function,
    logic: Function,
    options?: IControllerOptions
  ) {
    this.req = req;
    this.res = res;
    this._next = next;
    this.logic = logic.bind(this);

    this.name = options?.name || 'unknown';
    this.errorLevel = options?.errorLevel || 2;

    if (options?.validPermissions) {
      Array.isArray(options.validPermissions)
        ? (this.validPermissions = [
            ...options.validPermissions,
            PermissionsEnum.admin,
          ])
        : (this.validPermissions = [
            options.validPermissions,
            PermissionsEnum.admin,
          ]);
    }

    this.state = {
      dataErrors: {},
      failMsg: false,
    };
    this.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
    };
  }

  private eHandler(err: any): void {
    const req = this.req;

    if (err instanceof UserError) {
      this.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || 'unknown client error',
      };
      this.next();
      return;
    }

    logger.error(this.errorLevel, `Controller ${this.name}`, {
      userId: req.user?.id || 'unknown',
      error: err,
      headers: req.headers,
      body: req.body,
    });

    this.locals = {
      error: true,
      code: 500,
      message: 'internal server error',
    };
    this.next();
  }

  private async checkPerm(validPermIds: string[]): Promise<void> {
    try {
      const { req } = this;
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(
          2,
          `Controller ${this.name}: Request missing user or userId`,
          {
            userId: req.user?.id || 'unknown',
            headers: req.headers,
            body: req.body,
          }
        );

        throw new UserError('unauthorized', 401);
      }

      if (!(await userHasPermission(userId, validPermIds))) {
        throw new UserError('unauthorized', 401);
      }

      return;
    } catch (e) {
      this.eHandler(e);
    }
  }

  public async validateData<
    ET extends ExpectType,
    VO extends ValidatorOptions<ET>,
    E extends Record<string, { type: ET; options?: VO }>
  >(
    from: Record<string, any>,
    expect: E
  ): Promise<{
    [K in keyof E]: ValidatorTypes[E[K]['type']];
  }> {
    const dv = new DataValidator(this.state);
    const validData: Partial<{
      [K in keyof E]: ValidatorTypes[E[K]['type']];
    }> = {};

    const eKeys = Object.keys(expect) as (keyof E)[];

    for (let i = 0; i < eKeys.length; i++) {
      const key = eKeys[i];
      const { type, options } = expect[key];

      const result = await dv.check(
        from[key as string],
        key as string,
        type,
        options
      );

      if (result !== false) {
        validData[key] = result;
        continue;
      }
    }

    if (this.state.failMsg) {
      this.eHandler(new UserError(this.state.failMsg, 400));
    }

    return validData as {
      [K in keyof E]: ValidatorTypes[E[K]['type']];
    };
  }

  // TODO New validateData to do validation asynchronously. probably need to refactor DataValidator to not write to external state.
  // public async validateDataNew<
  //   ET extends ExpectType,
  //   VO extends ValidatorOptions<ET>
  // >(
  //   from: Record<string, any>,
  //   expect: ExpectParams<ET, VO>
  // ): Promise<Record<string, ValidatorTypes[ET] | undefined>> {
  //   const dv = new DataValidator({ dataErrors: {}, failMsg: false });
  //   const validData: Record<string, ValidatorTypes[ET] | undefined> = {};
  //   const fieldErrors: Record<string, string | object> = {};
  //   let globalFailMsg: string | false = false;

  //   await Promise.all(
  //     Object.entries(expect).map(async ([key, { type, options }]) => {
  //       const result = await dv.check(from[key], key, type, options);
  //       if (result !== false) {
  //         validData[key] = result;
  //       } else {
  //         validData[key] = undefined;
  //         fieldErrors[key] = dv.ctrlState.dataErrors[key];
  //         if (dv.ctrlState.failMsg && !globalFailMsg) {
  //           globalFailMsg = dv.ctrlState.failMsg;
  //         }
  //       }
  //     })
  //   );

  //   if (globalFailMsg) {
  //     this.state.dataErrors = fieldErrors;
  //     this.state.failMsg = globalFailMsg;
  //     throw new UserError(globalFailMsg, 400);
  //   }

  //   this.state.dataErrors = fieldErrors;
  //   return validData;
  // }

  public next(): void {
    if (Object.keys(this.state.dataErrors).length > 0) {
      if (!this.locals.payload) {
        this.locals.payload = {};
      }

      this.locals.payload = {
        ...this.locals.payload,
        errors: this.state.dataErrors,
      };
    }
    this.res.locals = this.locals;
    this._next();
  }

  public async run(): Promise<void> {
    try {
      if (this.validPermissions) {
        await this.checkPerm(this.validPermissions);
      }
      this.logic(this);
    } catch (e) {
      this.eHandler(e);
    }
  }
}

export default Controller;
