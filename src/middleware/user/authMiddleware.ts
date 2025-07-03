import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { StatusCodes } from "../../enums/StatusCodes";











export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {

  const authHeader = req.header("Authorization");

  const token = authHeader?.split(" ")[1] || "";
  if (!token) {
    return res.sendStatus(StatusCodes.UNAUTHORIZED);
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decodedUser) => {
    if (err) {
      return res.sendStatus(StatusCodes.FORBIDDEN);
    }

    (req as any).user = decodedUser;
    next();
  });
};
