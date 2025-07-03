import { Request, Response } from "express";

export interface IEventProfileController {
  PostEvent(req: Request, res: Response): Promise<Response>;
  getPostDetails(req: Request, res: Response): Promise<void>;
  getAllPost(req: Request, res: Response): Promise<void>;
  getAllPrivateCreatorsProfile(req: Request, res: Response): Promise<void>;
  updateProfileImage(req: Request, res: Response): Promise<Response>;
  updateProfileInfo(req: Request, res: Response): Promise<void>;
  getProfileInfo(req: Request, res: Response): Promise<void>;
}
