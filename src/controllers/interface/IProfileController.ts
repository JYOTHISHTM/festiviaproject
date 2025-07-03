import { Request, Response } from "express";
import { IUser } from "../../models/User";
import { ICreator } from "../../models/Creator";


export interface IProfileController {
  updateProfile(req: Request, res: Response): Promise<void>;
  getProfile(req: Request, res: Response): Promise<void>;
}
