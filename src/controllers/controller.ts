import DataValidator from "../modules/validator";
import type { Request, Response } from "express";
import type {
  ExpectType,
  ValidatorTypes,
  ValidatorOptions,
} from "../modules/validator/types";
import type { ControllerState, IControllerOptions, ILocals } from "./types";
import userHasPermission from "../modules/userPermissions/get";
import logger from "../modules/logger";
import { UserError } from "../util/error";
import type { LogLevel } from "../modules/logger/types";
import {
  PAGINATION_DEFAULT_PAGE_SIZE,
  PAGINATION_MAX_PAGE_SIZE,
  PermissionsEnum,
} from "global/const";
import { createPagination, type Pagination } from "util/pagination";

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

    this.name = options?.name || "unknown";
    this.errorLevel = options?.errorLevel || 2;

    if (options?.validPermissions) {
      if (Array.isArray(options.validPermissions)) {
        this.validPermissions = [
          ...options.validPermissions,
          PermissionsEnum.admin,
        ];
      } else {
        this.validPermissions = [
          options.validPermissions,
          PermissionsEnum.admin,
        ];
      }
    }

    this.state = {
      dataErrors: {},
      failMsg: false,
    };
    this.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
  }

  private eHandler(err: any): void {
    const req = this.req;

    if (err instanceof UserError) {
      this.locals = {
        error: true,
        code: err.code || 400,
        message: err.message || "unknown client error",
      };
      this.next();
      return;
    }

    logger.error(this.errorLevel, `Controller ${this.name}`, {
      userId: req.user?.id || "unknown",
      error: err,
      headers: req.headers,
      body: req.body,
    });

    this.locals = {
      error: true,
      code: 500,
      message: "internal server error",
    };
    this.next();
  }

  private async checkPerm(): Promise<void> {
    try {
      const { req } = this;
      const userId = req.user?.id;

      if (!userId) {
        logger.warn(2, `Controller ${this.name}: Request missing user`, {
          userId: req.user?.id || "unknown",
          headers: req.headers,
          body: req.body,
        });

        throw new UserError("unauthorized", 401);
      }

      if (!this.validPermissions) {
        throw new Error("validPermissions not set on controller");
      }

      const selfIdx = this.validPermissions.indexOf("self");
      if (selfIdx !== -1) {
        const selfCheckFields = [
          req.params.id,
          req.params.userId,
          req.body?.id,
          req.body?.userId,
          req.query.id,
          req.query.userId,
        ];

        if (selfCheckFields.some((field) => field === userId)) {
          return;
        }
        this.validPermissions.splice(selfIdx, 1);
      }

      if (!(await userHasPermission(userId, this.validPermissions!))) {
        throw new UserError("unauthorized", 401);
      }

      return;
    } catch (e) {
      this.eHandler(e);
    }
  }

  public getPagination(): Pagination {
    let page = 1;
    let pageSize = PAGINATION_DEFAULT_PAGE_SIZE as number;

    if (this.req.query.page !== undefined) {
      page = Number(this.req.query.page);
      if (!page || isNaN(page) || page < 1) {
        this.state.dataErrors.page = "page must be a positive integer";
        page = 1;
      }
    }

    if (this.req.query.pageSize !== undefined) {
      pageSize = Number(this.req.query.pageSize);
      if (!pageSize || isNaN(pageSize) || pageSize < 1) {
        this.state.dataErrors.pageSize = "pageSize must be a positive integer";
        pageSize = PAGINATION_DEFAULT_PAGE_SIZE as number;
      }
    }

    const validPage = Math.max(1, page);
    const validPageSize = Math.min(
      Math.max(1, pageSize),
      PAGINATION_MAX_PAGE_SIZE
    );

    return createPagination(validPage, validPageSize);
  }

  public async validateData<
    ET extends ExpectType,
    VO extends ValidatorOptions<ET>,
    E extends Record<string, { type: ET; options?: VO }>
  >(
    from: Record<string, any>,
    expect: E
  ): Promise<{
    [K in keyof E]: E[K]["options"] extends { required: true }
      ? ValidatorTypes[E[K]["type"]]
      : ValidatorTypes[E[K]["type"]] | undefined;
  }> {
    const dv = new DataValidator(this.state);
    const validData: Partial<{
      [K in keyof E]: E[K]["options"] extends { required: true }
        ? ValidatorTypes[E[K]["type"]]
        : ValidatorTypes[E[K]["type"]] | undefined;
    }> = {};

    for (const [key, config] of Object.entries(expect)) {
      const { type, options } = config;

      const result = await dv.check(from[key], key, type, options);

      if (result !== false) {
        (validData as any)[key] = result;
      }
    }

    if (this.state.failMsg) {
      this.eHandler(new UserError(this.state.failMsg, 400));
    }

    return validData as {
      [K in keyof E]: E[K]["options"] extends { required: true }
        ? ValidatorTypes[E[K]["type"]]
        : ValidatorTypes[E[K]["type"]] | undefined;
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
    const errorCount = Object.keys(this.state.dataErrors).length;
    if (errorCount > 0) {
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
        await this.checkPerm();
      }
      await this.logic(this);
      this.next();
    } catch (e) {
      this.eHandler(e);
    }
  }
}

export default Controller;
