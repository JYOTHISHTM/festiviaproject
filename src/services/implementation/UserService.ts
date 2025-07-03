
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { IUserService } from "../interface/IUserService";
import UserRepository from "../../repositories/implementation/UserRepository";
dotenv.config();
import { Ticket } from "../../models/Ticket";
class UserService implements IUserService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }


async getTicketsByUserId(userId: string, page: number, limit: number) {
  return await UserRepository.findTicketsByUserId(userId, page, limit);
}


 async cancelTicketAndRefund(ticketId: string, userId: string) {
  const ticket = await UserRepository.findTicketById(ticketId)

  if (!ticket) throw new Error("Ticket not found");

  if (ticket.userId.toString() !== userId) {
    throw new Error("Unauthorized: Ticket does not belong to user");
  }

  const event = ticket.eventId as { date: Date; price: number };

  const eventDate = new Date(event.date);
  const now = new Date();
  const diffInDays = (eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

  if (diffInDays < 2) {
    throw new Error("Ticket can only be cancelled at least 2 days before the event");
  }

  if (ticket.paymentStatus === "cancelled") {
    throw new Error("Ticket is already cancelled");
  }

  ticket.paymentStatus = "cancelled";
  await UserRepository.saveTicket(ticket);

  const user = await UserRepository.findUserById(userId);
  if (!user) throw new Error("User not found");

  const refundAmount = event.price / 2;
  await UserRepository.updateWalletBalance(userId, refundAmount);

  return { refundAmount };
}


 async fetchLayoutAndEvent(layoutId: string) {
    return await UserRepository.getSeatLayoutAndEvent(layoutId);
  }

  
}

export default new UserService();



