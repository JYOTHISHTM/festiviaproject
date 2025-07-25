import { ICreatorSubscription } from "../models/CreatorSubscription"; // adjust path if needed

export const CreatorSubscriptionDTO = (subscription: ICreatorSubscription) => ({
  _id: subscription._id,
  name: subscription.name,
  price: subscription.price,
  days: subscription.days,
  subscribedAt: subscription.subscribedAt,
  status: subscription.status
});
