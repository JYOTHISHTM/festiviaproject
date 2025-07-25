import { Request, Response } from 'express';
import { SubscriptionService } from '../../services/implementation/SubscriptionService';
import { SubscriptionRepository } from '../../repositories/implementation/SubscriptionRepository';
import { StatusCodes } from "../../enums/StatusCodes";
import { CreatorSubscriptionDTO } from '../../dto/creatorSubscriptionDto';



const subscriptionRepository = new SubscriptionRepository();
const subscriptionService = new SubscriptionService(subscriptionRepository);

export class SubscriptionController {

  async createSubscriptionCheckout(req: Request, res: Response) {
    try {
      const { creatorId, name } = req.body;
      console.log("req body in contrl",req.body);
      
      const checkoutUrl = await subscriptionService.createCheckoutSession(creatorId, name);
      res.status(StatusCodes.OK).json({ url: checkoutUrl });
    } catch (error) {
      console.error(error);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Stripe Checkout Error' });
    }
  }


async buyUsingWallet(req: Request, res: Response) {
  try {
    const { creatorId, planName } = req.body;

    const subscription = await subscriptionService.buyUsingWallet(creatorId, planName);

    return res.status(StatusCodes.OK).json({
      message: 'Subscription purchased using wallet',
      subscription
    });
  } catch (err: any) {
    console.error('Buy wallet error:', err.message);
    return res.status(StatusCodes.BAD_REQUEST).json({ message: err.message });
  }
}



  // async getCreatorSubscription(req: Request, res: Response) {
  //   try {
  //     const creatorId = (req as any).creator.id;
  //     const subscription = await subscriptionService.fetchCreatorSubscription(creatorId);
  //     if (!subscription) {
  //       return res.status(StatusCodes.OK).json(null);
  //     }
  //     return res.status(StatusCodes.OK).json(subscription);
  //   } catch (err) {
  //     console.error("Error fetching subscription:", err);
  //     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching subscription' });
  //   }
  // };

  async getCreatorSubscription(req: Request, res: Response): Promise<void> {
    try {
      const creatorId = (req as any).creator?.id;
      const subscription = await subscriptionService.fetchCreatorSubscription(creatorId);

      const subscriptionDto = subscription
        ? CreatorSubscriptionDTO(subscription)
        : null;

      res.status(StatusCodes.OK).json(subscriptionDto);

    } catch (err) {
      console.error("Error fetching subscription:", err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching subscription' });
    }
  }

  async getAllSubscriptionPlan(req: Request, res: Response): Promise<Response> {
    try {
      const plan = await subscriptionService.getAllSubscriptionPlan();
      console.log(plan);
      
      return res.status(StatusCodes.OK).json(plan);
    } catch (error) {
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching subscription plan' });
    }
  }
async getCreatorHistory(req: Request, res: Response) {
  try {
    const creatorId = (req as any).creator?.id;
    if (!creatorId) return res.status(400).json({ message: "Creator ID missing" });

    const page = parseInt(req.query.page as string) || 1;
    const limit = 5;

    const { subscriptions, total } = await subscriptionService.getCreatorHistory(creatorId, page, limit);

    res.status(StatusCodes.OK).json({
      success: true,
      history: subscriptions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to fetch history.'
    });
  }
}

async getSubscriptionHistory(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const { subscriptions, totalCount } = await subscriptionService.getSubscriptionHistory(page, limit);

    res.status(StatusCodes.OK).json({
      success: true,
      history: subscriptions,
      totalCount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'Failed to fetch history.' });
  }
}


  async expireSubscription(req: Request, res: Response) {
    try {
      const { creatorId } = req.params
      console.log("Creatorwwwwwwwwww id",creatorId);
      
      await subscriptionService.expireSubscription(creatorId)
      
      res.status(StatusCodes.OK).json({ message: 'Subscription marked as expired' })
    } catch (err) {
      console.error('Expire subscription err', err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "internal server error" })
    }
  }

}
