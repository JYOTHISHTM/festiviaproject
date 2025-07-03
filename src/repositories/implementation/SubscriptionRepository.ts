import CreatorSubscription from "../../models/CreatorSubscription";
import mongoose from "mongoose";
import { ICreatorSubscription } from '../../models/CreatorSubscription'
import Subscription from "../../models/Subscription";
import { Wallet } from '../../models/Wallet';

export class SubscriptionRepository {


async buySubscriptionUsingWallet(creatorId: string, planName: string) {
  const plan = await Subscription.findOne({ name: planName });
  if (!plan) throw new Error('Invalid subscription plan');

  const wallet = await Wallet.findOne({ creator: creatorId });
  if (!wallet || wallet.balance < plan.price) {
    throw new Error('Insufficient wallet balance');
  }

  await CreatorSubscription.updateMany(
    { creatorId, status: 'active' },
    { $set: { status: 'expired' } }
  );

  wallet.balance -= plan.price;
  wallet.transactions.push({ type: 'deduct', amount: plan.price });
  await wallet.save();

  const startDate = new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.days);

  const subscription = await CreatorSubscription.create({
    creatorId,
    name: plan.name,
    price: plan.price,
    days: plan.days,
    startDate,
    endDate,
    subscribedAt: startDate,
    paymentMethod: 'wallet',
    status: 'active'
  });

  return subscription;
}




















  async saveCustomerSubscription(customerId: string, subscriptionId: string) {
    return { customerId, subscriptionId };
  }

  async getSubscriptionByCreatorId(creatorId: string) {
    return await CreatorSubscription.findOne({
      creatorId: new mongoose.Types.ObjectId(creatorId),
      status: 'active', 
    });
  }

  async getAllSubscriptionPlan(): Promise<ICreatorSubscription[] | null> {
    return await Subscription.find({});
  }



async getSubscriptionsByCreatorId(creatorId: string, page: number = 1, limit: number = 5) {
  const skip = (page - 1) * limit;
  const subscriptions = await CreatorSubscription.find({ creatorId })
    .sort({ subscribedAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await CreatorSubscription.countDocuments({ creatorId });

  return { subscriptions, total };
}




async getSubscriptionsForAdmin(page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit;

  const [subscriptions, totalCount] = await Promise.all([
    CreatorSubscription.find()
      .populate('creatorId', 'name email')
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(limit),
    CreatorSubscription.countDocuments()
  ]);

  return { subscriptions, totalCount };
}

  async createSubscription(data: any) {
    return await CreatorSubscription.create(data);
  }


 async setSubscriptionExpired(creatorId: string) {
  console.log("hit repo with ", creatorId);

  const filter = { creatorId: new mongoose.Types.ObjectId(creatorId), status: 'active' };
  const update = { status: 'expired' };

  console.log("Query filter: ", filter);
  console.log("Update data: ", update);

  const result = await CreatorSubscription.findOneAndUpdate(filter, update, { new: true });

  console.log("Update result:", result);

  return result;
}

}
