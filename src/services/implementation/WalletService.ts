import WalletRepository from "../../repositories/implementation/WalletRepository";
import { IWalletService } from "../interface/IWalletService";
import Stripe from 'stripe';
import User from "../../models/User";
import Creator from "../../models/Creator";
import { markSeatAsBooked } from '../../repositories/implementation/TicketRepository';
import { Ticket } from "../../models/Ticket";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

class WalletService implements IWalletService {



async bookTicketUsingWallet(userId: string, totalAmount: number, bookingDetails: any) {
  const wallet = await WalletRepository.getWalletForBooking(userId);
  console.log("wallet", wallet);

  if (!wallet || wallet.balance < totalAmount) {
    return { success: false, message: 'Insufficient wallet balance' };
  }

  const updated = await WalletRepository.deductAmount(userId, totalAmount);
  if (!updated) {
    return { success: false, message: 'Failed to deduct wallet balance' };
  }

  const { seatLayoutId, selectedSeats, eventId } = bookingDetails;
  console.log("booking details in service", bookingDetails);

  for (const seat of selectedSeats) {
    await markSeatAsBooked(seatLayoutId, seat);
  }

  const ticket = new Ticket({
    userId,
    eventId,
    price: totalAmount,
    seats: selectedSeats,
    paymentStatus: 'success',
  });

  const savedTicket = await ticket.save();

  return {
    success: true,
    data: {
      ticket: savedTicket,
      selectedSeats,
      eventId,
    }
  };
}


  async addMoney(userId: string, amount: number) {
    if (amount <= 0) throw new Error("Amount must be more than 0");
    if (amount > 10000) throw new Error("Amount cannot exceed ₹10,000");

    let wallet = await WalletRepository.getWalletByUserId(userId);

    if (!wallet) {
      wallet = await WalletRepository.createWallet(userId);
    }

    const totalAfterAdd = wallet.balance + amount;
    if (totalAfterAdd > 50000) throw new Error("Wallet limit is ₹50,000");

    console.log('Calling updateWallet for user:', userId, 'amount:', amount);
    return await WalletRepository.updateWallet(userId, amount, 'add');
  }


  async addMoneyToCreator(creatorId: string, amount: number) {
    if (amount <= 0) throw new Error("Amount must be more than 0");
    if (amount > 10000) throw new Error("Amount cannot exceed ₹10,000");

    let wallet = await WalletRepository.getWalletByCreatorId(creatorId);
    console.log("wallet in repo ", wallet);

    if (!wallet) {
      wallet = await WalletRepository.createWalletForCreator(creatorId);
    }

    const totalAfterAdd = wallet.balance += amount;
    if (totalAfterAdd > 50000) throw new Error("Wallet limit is ₹50,000");

    return await WalletRepository.updateWalletToCreator(creatorId, amount, 'add');
  }



  async getWallet(userId: string) {
    let wallet = await WalletRepository.getWalletByUserId(userId);
    if (!wallet) {
      wallet = await WalletRepository.createWallet(userId);
    }
    return wallet;
  }


  async getWalletForCreator(creatorId: string) {
    let wallet = await WalletRepository.getWalletByCreatorId(creatorId);

    if (!wallet) {
      wallet = await WalletRepository.createWalletForCreator(creatorId);
    }
    return wallet;
  }


  async createStripeSession(userId: string, amount: number) {
    if (!userId || !amount) {
      throw new Error("User ID and amount are required");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found.");
    }

    const amountInPaise = amount * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Add ₹${amount} to Wallet`,
            description: `Wallet top-up for ${user.name}`,
          },
          unit_amount: amountInPaise,
        },
        quantity: 1,
      }],
      customer_email: user.email,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/user/wallet?userId=${userId}&amount=${amount}`,
      cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`,
    });

    return session.url;
  }



  async createStripeSessionForCreator(creatorId: string, amount: number) {
    if (!creatorId || !amount) {
      throw new Error("creatorId and amount are required");
    }

    const creator = await Creator.findById(creatorId);
    if (!creator) {
      throw new Error("creator not found.");
    }

    const amountInPaise = amount * 100;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `Add ₹${amount} to Wallet`,
            description: `Wallet top-up for ${creator.name}`,
          },
          unit_amount: amountInPaise,
        },
        quantity: 1,
      }],
      customer_email: creator.email,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/creator/wallet?creatorId=${creatorId}&amount=${amount}`,
      cancel_url: `${process.env.FRONTEND_URL}/wallet/cancel`,
    });

    return session.url;
  }





}

export default new WalletService();
