



import { Request, Response } from "express";

export interface IAuthController {
    login(req: Request, res: Response): Promise<Response>;
    refreshToken(req: Request, res: Response): Promise<Response>;
    resendOTP(req: Request, res: Response):Promise<Response>;
    signUp(req: Request, res: Response): Promise<Response>;
    verifyOTP(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<Response>;
    sendOtp(req: Request, res: Response): Promise<void>;
    googleCallback(req: Request, res: Response): Promise<Response>;
}
