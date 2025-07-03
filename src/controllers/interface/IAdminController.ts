import { Request, Response } from "express";

export interface IAdminController {
  login(req: Request, res: Response): Promise<Response>;
  getUsers(req: Request, res: Response): Promise<Response>;
  getCreators(req: Request, res: Response): Promise<Response>;
  blockUser(req: Request, res: Response): Promise<Response>;
  blockCreator(req: Request, res: Response): Promise<Response>;
  logout(req: Request, res: Response): Promise<void>;
  approveCreator(req: Request, res: Response): Promise<Response>;
  rejectCreator(req: Request, res: Response): Promise<Response>;
  getPendingCreators(req: Request, res: Response): Promise<Response>;
  getSubscriptionPlan(req: Request, res: Response): Promise<Response>;
  reapplyCreator(req: Request, res: Response): Promise<void>
  getDashboardData(req: Request, res: Response): Promise<void>
  deleteSubscription(req: Request, res: Response): Promise<void>
}
