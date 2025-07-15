import EventModel from "../../models/Event";
import mongoose from "mongoose";

class EventRepository  {




  async getEventsByLocation(latitude: number, longitude: number) {
  const event= await EventModel.find({
    geoLocation: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [longitude, latitude],
        },
        $maxDistance: 100000
      }
    }
  });
  console.log("Matched events:", event);

}

  async getEventByIdForTicket(eventId: string) {
    return await EventModel.findById(eventId).lean();
  }


  async getHomeEvents() {
    try {
      return await EventModel.find({ isListed: true });
    } catch (error) {
      throw new Error('Error fetching events from the database');
    }
  }
async getAllListedEvents(creatorId: string, page: number, limit: number) {
  try {
    const skip = (page - 1) * limit;
    return await EventModel.find({ creatorId }).skip(skip).limit(limit);
  } catch (error) {
    throw new Error('Error fetching events from the database');
  }
}


async getEventById(id: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await EventModel.findById(id).populate('layoutId')
}
 async getAllEvents(filters: any, skip: number, limit: number) {
    const finalFilters = {
      ...filters,
      isListed: true,
    };


 
    return await EventModel.find(finalFilters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }


  async countEvents(filters: any) {
    return await EventModel.countDocuments(filters);
  }

  async updateDescription(eventId: string, description: string) {
    return await EventModel.findByIdAndUpdate(
      eventId,
      { description },
      { new: true }
    );
  }

  async getEventType() {
    return await EventModel.distinct('eventType');
  }

  async toggleListingStatus(id: string) {
    const event = await EventModel.findById(id);
    if (!event) throw new Error('Event not found');
    event.isListed = !event.isListed;
    return await event.save();
  };
}

export default new EventRepository();
