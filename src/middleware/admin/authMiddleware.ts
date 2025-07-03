

import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "../../enums/StatusCodes";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1] || "";
  if (!token) return res.sendStatus(StatusCodes.UNAUTHORIZED); 

  jwt.verify(token, process.env.JWT_SECRET!, (err, decodedAdmin) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN); 
    (req as any).admin = decodedAdmin; 
    next();
  });
};

