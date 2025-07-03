import { Request, Response } from "express";
import { IWalletController } from '../interface/IWalletController';
import WalletService from '../../services/implementation/WalletService';
import Stripe from 'stripe';
import { StatusCodes } from "../../enums/StatusCodes";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class WalletController implements IWalletController {

  async bookTicketWithWalletController(req: Request, res: Response) {
    try {
      const { userId, totalAmount, bookingDetails } = req.body;

      const result = await WalletService.bookTicketUsingWallet(userId, totalAmount, bookingDetails);
      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: result.message });
      }
      return res.status(StatusCodes.OK).json({ success: true, message: 'Booking successful', data: result.data });

    } catch (error) {
      console.error('Booking Error:', error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Internal Server Error' });
    }
  };

  async createCheckoutSession(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, amount } = req.body;
      const sessionUrl = await WalletService.createStripeSession(userId, amount);
      return res.status(StatusCodes.OK).json({ success: true, url: sessionUrl });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  }

  async createCheckoutSessionForCreator(req: Request, res: Response): Promise<Response> {
    try {
      const { creatorId, amount } = req.body;
      const sessionUrl = await WalletService.createStripeSessionForCreator(creatorId, amount);
      return res.status(StatusCodes.OK).json({ success: true, url: sessionUrl });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  }


  async addMoney(req: Request, res: Response): Promise<Response> {
    try {
      const { userId, amount } = req.body;
      if (!userId || amount === undefined) {
        return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: 'User ID and amount are required.' });
      }
      const result = await WalletService.addMoney(userId, amount);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: error.message });
    }
  }


  async addMoneyToCreator(req: Request, res: Response): Promise<Response> {
    try {
      const { creatorId, amount } = req.body;

      if (!creatorId || amount === undefined) {
        return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: 'creatorId  and amount are required.' });
      }

      const result = await WalletService.addMoneyToCreator(creatorId, amount);

      return res.json({ success: true, data: result });
    } catch (error: any) {
      return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: error.message });
    }
  }


  async getWallet(req: Request, res: Response): Promise<Response> {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: 'User ID is required.' });
      }
      const wallet = await WalletService.getWallet(userId);
      if (!wallet) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Wallet not found.' });
      }

      return res.json({ success: true, data: wallet });
    } catch (error: any) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  }

  async getWalletForCreator(req: Request, res: Response): Promise<Response> {
    try {
      const { creatorId } = req.params;
      if (!creatorId) {
        return res.status(StatusCodes.BAD_REQUEST ).json({ success: false, message: 'creatorId is required.' });
      }
      const wallet = await WalletService.getWalletForCreator(creatorId);
      if (!wallet) {
        return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'Wallet not found.' });
      }
      return res.json({ success: true, data: wallet });
    } catch (error: any) {
      console.error("Wallet fetch/create error:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
    }
  }


}


export default WalletController;
