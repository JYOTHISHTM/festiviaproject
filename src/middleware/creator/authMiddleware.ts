

import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "../../enums/StatusCodes";

import jwt from "jsonwebtoken";

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization")?.split(" ")[1] || "";
  if (!token) return res.sendStatus(StatusCodes.UNAUTHORIZED); 

  jwt.verify(token, process.env.JWT_SECRET!, (err, decodedCreator) => {
    if (err) return res.sendStatus(StatusCodes.FORBIDDEN); 
    console.log("decoded creator",decodedCreator);
    
    (req as any).creator = decodedCreator; 
    console.log("decoded creator",decodedCreator);
    next();
  });
};

