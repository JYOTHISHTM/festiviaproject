import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../enums/StatusCodes";

export const attachErrorMessage = (err: any, req: Request, res: Response, next: NextFunction) => {
  res.locals.errorMessage = err.message;
  next(err);
};

export const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  console.error("Error:", err.message);
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "Internal Server Error" });
};
