import { Request, Response } from "express";

export interface IChatController {
    getChatHistory(req: Request, res: Response): Promise<void>;
    getChatHistoryForCreator(req: Request, res: Response): Promise<void>;
    getChatsForUser(req: Request, res: Response): Promise<void>;
    getChatsForCreator(req: Request, res: Response): Promise<void>;
    getUsersWhoMessagedCreator(req: Request, res: Response): Promise<void>;
}
