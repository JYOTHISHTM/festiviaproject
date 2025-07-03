import express, { Request, Response, NextFunction } from "express";

const rawBodyMiddleware = express.raw({ type: "application/json" });

export const handleRawBody = (req: Request, res: Response, next: NextFunction) => {
  if (req.path === "/webhook" && req.method === "POST") {
    rawBodyMiddleware(req, res, next);
  } else {
    express.json()(req, res, next);
  }
};
