// controllers/interface/IWalletController.ts
import { Request, Response } from "express";

export interface IWalletController {
  addMoney(req: Request, res: Response): Promise<Response>;
}
