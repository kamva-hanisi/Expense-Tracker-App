import type { NextFunction, Request, RequestHandler, Response } from "express";

type AsyncRoute = (
  request: Request,
  response: Response,
  next: NextFunction,
) => Promise<unknown>;

export const asyncHandler = (route: AsyncRoute): RequestHandler =>
  (request, response, next) => {
    void Promise.resolve(route(request, response, next)).catch(next);
  };
