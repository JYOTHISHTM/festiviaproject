import { Request, Response } from "express";

export interface ICreatorController {
  createEvent(req: Request, res: Response): Promise<Response>;
  getCreator(req: Request, res: Response): Promise<Response>;
  getReservedEvents(req: Request, res: Response): Promise<Response>;
}
