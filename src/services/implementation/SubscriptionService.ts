import { stripe } from '../../utils/stripe';
import { SubscriptionRepository } from '../../repositories/implementation/SubscriptionRepository';
import { ICreatorSubscription } from '../../models/CreatorSubscription'
import Subscription from '../../models/Subscription';

export class SubscriptionService {
  constructor(private subscriptionRepository: SubscriptionRepository) { }


async createCheckoutSession(creatorId: string, name: string): Promise<string> {

  const plan = await Subscription.findOne({ name });

  if (!plan) throw new Error("Invalid plan selected");

  const successUrl = `${process.env.FRONTEND_URL}/creator/success`;
  const cancelUrl = `${process.env.FRONTEND_URL}/creator/cancel`;

  const customer = await stripe.customers.create({
    metadata: {
      creatorId,
      planName: plan.name
    }
  });

  const session = await stripe.checkout.sessions.create({
    mode: 'payment', 
    customer: customer.id,
    payment_method_types: ['card'],
    line_items: [{
      price_data: {
        currency: 'inr',
        product_data: {
          name: plan.name
        },
        unit_amount: plan.price * 100 
      },
      quantity: 1
    }],
    success_url: successUrl,
    cancel_url: cancelUrl
  });

  if (!session.url) {
    throw new Error("Failed to create checkout session URL");
  }

  return session.url;
}



async buyUsingWallet(creatorId: string, planName: string) {
  return await this.subscriptionRepository.buySubscriptionUsingWallet(creatorId, planName);
}







  async fetchCreatorSubscription(creatorId: string) {
    const subscription = await this.subscriptionRepository.getSubscriptionByCreatorId(creatorId);
    return subscription;
  };

  async getAllSubscriptionPlan(): Promise<ICreatorSubscription[] | null> {
    return await this.subscriptionRepository.getAllSubscriptionPlan();
  }

async getCreatorHistory(creatorId: string, page: number = 1, limit: number = 5) {
  return await this.subscriptionRepository.getSubscriptionsByCreatorId(creatorId, page, limit);
}


///
async getSubscriptionHistory(page: number = 1, limit: number = 10) {
  return await this.subscriptionRepository.getSubscriptionsForAdmin(page, limit);
}

///


  async saveSubscription(data: any) {
    return await this.subscriptionRepository.createSubscription(data);
  }


  async expireSubscription(creatorId:string){
    console.log("expireSubscription for crtr id",creatorId);
    return await this.subscriptionRepository.setSubscriptionExpired(creatorId)
  }
}
