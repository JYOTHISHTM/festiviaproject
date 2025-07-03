import UserModel, { IUser } from "../../models/User";
import { BaseRepository } from "../implementation/BaseRepository";
import { IUserRepository } from "../interface/IUserRepository";
import { Ticket } from "../../models/Ticket";
import { Wallet } from "../../models/Wallet";
import EventModel from "../../models/Event";
import SeatLayoutModel from "../../models/SeatLayoutModel";
import mongoose from "mongoose";



class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(UserModel);
  }

  async updateUserLocation(userId: string, location: string, latitude: number, longitude: number) {
  return await UserModel.findByIdAndUpdate(userId, {
    location,
    geoLocation: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  }, { new: true });
}

  async getUserById(userId: string): Promise<IUser | null> {
    return await UserModel.findById(userId);
  };

  async countUsers(): Promise<number> {
    return UserModel.countDocuments();
  }


  async findTicketsByUserId(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;

  const [tickets, total] = await Promise.all([
    Ticket.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Ticket.countDocuments({ userId })
  ]);

  return {
    tickets,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
    totalItems: total
  };
}


  async findByEmail(email: string): Promise<IUser | null> {
    return await UserModel.findOne({ email });
  }


  async updateRefreshToken(userId: string, refreshToken: string) {
    return await UserModel.findByIdAndUpdate(userId, { refreshToken });
  }
  async blockUser(userId: string): Promise<IUser | null> {
    return await this.update(userId, { isBlocked: true });
  }


  async logout(userId: string): Promise<{ message: string }> {
    try {
      await UserModel.deleteOne({ _id: userId });
      return { message: "Logout successful" };
    } catch (error) {
      throw new Error("Logout failed");
    }
  }




  async updateOtp(email: string, otp: string, otpExpires: Date) {
    return UserModel.updateOne({ email }, { otp, otpExpires });
  }

  async updatePassword(email: string, password: string) {
    return UserModel.updateOne({ email }, { password, otp: null });
  }

  async findTicketById(ticketId: string) {
    return Ticket.findById(ticketId).populate("eventId");
  }

  async saveTicket(ticket: any) {
    return ticket.save();
  }
  async findUserById(userId: string) {
    return UserModel.findById(userId);
  }
  async updateWalletBalance(userId: string, amount: number) {
  const wallet = await Wallet.findOne({ user: userId });

  if (!wallet) {
    throw new Error("Wallet not found for this user");
  }


  const transaction = {
    type:'refund',
    amount: Math.abs(amount),
    date: new Date(),
  };

  wallet.balance += amount;
  wallet.transactions.push(transaction);

  await wallet.save();


  return wallet;
}


async getSeatLayoutAndEvent(layoutId: string) {
    if (!mongoose.Types.ObjectId.isValid(layoutId)) {
      throw new Error('Invalid layoutId');
    }

    const layout = await SeatLayoutModel.findById(layoutId).lean();
    if (!layout) throw new Error('Seat layout not found');

    const event = await EventModel.findOne({ layoutId: layout._id }).select('eventName image').lean();
    if (!event) throw new Error('Event not found for this layout');

    return { layout, event };
  }



}

export default new UserRepository();
