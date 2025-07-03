import CreatorModel, { ICreator } from "../../models/Creator";
import EventModel, { IEvent } from "../../models/Event";
import { BaseRepository } from "../implementation/BaseRepository";
import { ICreatorRepository } from "../interface/ICreatorRepository";
import SeatLayoutModel from "../../models/SeatLayoutModel";
import mongoose from "mongoose";

class CreatorRepository extends BaseRepository<ICreator> implements ICreatorRepository {
  constructor() {
    super(CreatorModel);
  }


  async countCreators(): Promise<number> {
    return CreatorModel.countDocuments();
  }
  async countPendings(): Promise<number> {
    return CreatorModel.countDocuments({ status: 'pending' });
  }


  async findByEmail(email: string): Promise<any> {
    return await CreatorModel.findOne({ email });
  }

  async updateRefreshToken(id: string, refreshToken: string): Promise<void> {
    await CreatorModel.findByIdAndUpdate(id, { refreshToken });
  }


  async findByRefreshToken(refreshToken: string): Promise<any> {
    return await CreatorModel.findOne({ refreshToken });
  }

  async clearRefreshToken(id: string): Promise<void> {
    await CreatorModel.findByIdAndUpdate(id, { refreshToken: "" });
  }

  async findById(creatorId: string): Promise<any> {
    return await CreatorModel.findById(creatorId).select("-password");
  }
  async blockCreator(creatorId: string): Promise<ICreator | null> {
    return await this.update(creatorId, { isBlocked: true });
  }


  async createEvent(eventData: Partial<IEvent>): Promise<IEvent> {
    return await EventModel.create(eventData);
  }


  async findPendingCreators(): Promise<ICreator[]> {
    return await CreatorModel.find({ status: "pending" });
  }

  async getCreatorStatus(creatorId: string) {
    try {
      const creator = await CreatorModel.findById(creatorId).select('status rejectionReason');

      if (!creator) {
        throw new Error("Creator not found");
      }

      return creator;
    } catch (error) {
      throw new Error("Error fetching creator status: ");
    }
  }


  async approveCreator(creatorId: string): Promise<ICreator | null> {
    const creator = await CreatorModel.findByIdAndUpdate(
      creatorId,
      { status: "approved" },
      { new: true }
    );
    return creator;
  }

  async rejectCreator(creatorId: string, rejectionReason: string): Promise<ICreator | null> {
    const creator = await CreatorModel.findByIdAndUpdate(
      creatorId,
      {
        status: "rejected",
        rejectionReason: rejectionReason
      },
      { new: true }
    );
    return creator;
  }

 async findReservedEventsByCreator(layoutId: string){
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

export default new CreatorRepository();
