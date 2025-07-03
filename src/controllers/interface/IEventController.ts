

import { Request, Response } from "express";


export interface IEventController{
    getEventById(req: Request, res: Response): Promise<Response>;
    getAllEvents(req: Request, res: Response): Promise<Response>;
    getEventType(req: Request, res: Response): Promise<Response>;
    getHomeEvents(req: Request, res: Response): Promise<void>;
    getAllListedEvents(req: Request, res: Response): Promise<void>;
    toggleListStatus(req: Request, res: Response): Promise<void>;
    updateDescription(req: Request, res: Response): Promise<void>;
    updateLocation(req: Request, res: Response): Promise<void>;
}