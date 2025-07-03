import EventRepository from "../../repositories/implementation/EventRepository";
import { IEventService } from '../interface/IEventService'
import { Ticket } from "../../models/Ticket";
import { stripe } from "../../utils/stripe";
import UserRepository from "../../repositories/implementation/UserRepository";

class EventService implements IEventService {


  async updateLocation(userId: string, location: string, latitude: number, longitude: number) {
  return await UserRepository.updateUserLocation(userId, location, latitude, longitude);
}


  async getUser(userId: string) {
    return await UserRepository.getUserById(userId);
  };


  async fetchEventsForUserLocation(latitude: number, longitude: number) {
  return await EventRepository.getEventsByLocation(latitude, longitude);
}


  async bookTicket(userId: string, eventId: string) {
    const event = await EventRepository.getEventByIdForTicket(eventId) as any;
    const user = await UserRepository.findById(userId)

    console.log("user", user);

    console.log("event jjj", event);

    console.log("event.title:", event.eventName);
    console.log("event.price:", event.price);

    if (!event) throw new Error('Event not found');

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: { name: event.eventName },
            unit_amount: Math.round(event.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/user/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      customer_email: user?.email,
    });


    await Ticket.create({
      userId,
      eventId,
      price: event.price,
    });

    return session.url;
  }

  async updateDescription(eventId: string, description: string) {
    return await EventRepository.updateDescription(eventId, description);
  }

  async getHomeEvents() {
    try {
      return await EventRepository.getHomeEvents();
    } catch (error) {
      throw new Error('Error fetching home events');
    }
  }

async getAllListedEvents(creatorId: string, page: number, limit: number) {
  try {
    return await EventRepository.getAllListedEvents(creatorId, page, limit);
  } catch (error) {
    throw new Error('Error fetching home events');
  }
}


async getEventById(id: string) {
  const event = await EventRepository.getEventById(id);
  return event;
}


  async getAllEvents(filters: any, skip: number, limit: number) {
    return await EventRepository.getAllEvents(filters, skip, limit);
  }

  async countEvents(filters: any) {
    return await EventRepository.countEvents(filters);
  }



  async getEventType() {
    return await EventRepository.getEventType();
  }

  async toggleEventListing(eventId: string) {
    return await EventRepository.toggleListingStatus(eventId);
  };


}

export default new EventService();
