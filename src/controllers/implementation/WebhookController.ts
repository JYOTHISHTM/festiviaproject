import Stripe from 'stripe';
import { Request, Response } from 'express';
import dotenv from 'dotenv';
import CreatorSubscription from '../../models/CreatorSubscription';
import SubscriptionPlan from '../../models/Subscription';
import mongoose from 'mongoose';
import { StatusCodes } from "../../enums/StatusCodes";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil', 
});

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];

  
  if (!sig) {
    console.error('❌ No Stripe signature found');
    return res.status(StatusCodes.BAD_REQUEST).send('Missing stripe-signature header');
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET environment variable');
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send('Server configuration error');
  }

  const payload = req.body;
  if (!payload || (typeof payload !== 'string' && !Buffer.isBuffer(payload))) {
    console.error('❌ Invalid payload format:', typeof payload);
    return res.status(StatusCodes.BAD_REQUEST).send('Invalid payload format');
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error(`❌ Webhook verification failed: ${err.message}`);
    return res.status(StatusCodes.BAD_REQUEST).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        break;
        
      default:
    }

    return res.status(StatusCodes.OK).json({ received: true });
  } catch (error: any) {
    console.error(`❌ Error processing ${event.type}:`, error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send(`Error processing event: ${error.message}`);
  }
};

async function handleCheckoutSession(session: Stripe.Checkout.Session) {

  if (!session.customer) {
    console.error('❌ No customer associated with session');
    throw new Error('No customer associated with session');
  }

  const customerId = typeof session.customer === 'string' 
    ? session.customer 
    : session.customer.id;

  const customer = await stripe.customers.retrieve(customerId);
  
  if (!('metadata' in customer) || customer.deleted) {
    console.error('❌ Invalid customer or customer was deleted');
    throw new Error('Invalid customer data');
  }
  
  
  const { creatorId, planId } = customer.metadata;
  
  if (!creatorId || !planId) {
    console.error('❌ Missing metadata in customer');
    throw new Error('Missing required metadata: creatorId or planId');
  }

  const plan = await SubscriptionPlan.findById(planId);
  if (!plan) {
    console.error(`❌ Subscription plan not found: ${planId}`);
    throw new Error(`Plan not found: ${planId}`);
  }

  const existingSubscription = await CreatorSubscription.findOne({
    creatorId: new mongoose.Types.ObjectId(creatorId),
      status: 'active' 

  });

  if (existingSubscription) {
    existingSubscription.name = plan.name;
    existingSubscription.price = plan.price;
    existingSubscription.days = Number(plan.days);
    existingSubscription.startDate = new Date();
    existingSubscription.endDate = new Date(
      Date.now() + Number(plan.days) * 24 * 60 * 60 * 1000
    );
    await existingSubscription.save();
  } else {
    await CreatorSubscription.create({
      creatorId: new mongoose.Types.ObjectId(creatorId),
      name: plan.name,
        paymentMethod: 'Credit Card',
      price: plan.price,
      duration: Number(plan.days),
      startDate: new Date(),
      endDate: new Date(
        Date.now() + Number(plan.days) * 24 * 60 * 60 * 1000
      ),
    });
  }

}