import { Request, Response } from "express";
import { IEventController } from '../interface/IEventController'
import EventService from '../../services/implementation/EventService'
import { StatusCodes } from "../../enums/StatusCodes";

interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
  };
}

class EventController implements IEventController {


  async getHomeEvents(req: Request, res: Response): Promise<void> {
    try {
      const events = await EventService.getHomeEvents();

      res.json(events);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching home events' });
    }
  }

  async getAllListedEvents(req: Request, res: Response): Promise<void> {
    try {
      const { creatorId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = 6;

      if (!creatorId) {
        res.status(StatusCodes.BAD_REQUEST).json({ message: "missing creator id" });
        return;
      }

      const events = await EventService.getAllListedEvents(creatorId, page, limit);
      res.json(events);
    } catch (error) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Error fetching events' });
    }
  }

  async getEventById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);

      if (!event) {
        return res.status(StatusCodes.NOT_FOUND).json({ error: "Event not found" });
      }

      return res.json(event);
    } catch (error) {
      console.error("❌ Error fetching event:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: "An error occurred while fetching the event." });
    }
  }


  async getAllEvents(req: Request, res: Response): Promise<Response> {
    try {
      const { search, eventType, minPrice, maxPrice, page = 1, limit = 9 } = req.query;

      const filters: any = {};
      console.log(filters);

      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 9;
      const skip = (pageNum - 1) * limitNum;

      if (search) {
        filters.eventName = { $regex: search, $options: 'i' };
      }

      if (eventType) {
        filters.eventType = eventType;
      }

      if (minPrice || maxPrice) {
        filters.price = {};
        if (minPrice) filters.price.$gte = Number(minPrice);
        if (maxPrice) filters.price.$lte = Number(maxPrice);
      }


      if (req.query.location) {
        filters.location = { $regex: req.query.location as string, $options: 'i' };
      }

      console.log('Query filters:', filters);

      const [events, total] = await Promise.all([
        EventService.getAllEvents(filters, skip, limitNum),
        EventService.countEvents(filters)
      ]);

      console.log(`Found ${total} events matching filters, returning page ${pageNum}`);

      return res.status(StatusCodes.OK).json({
        events,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum)
      });
    } catch (error) {
      console.error("❌ Error fetching all events:", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch events" });
    }
  }


  async getEventType(req: Request, res: Response): Promise<Response> {
    try {
      const eventType = await EventService.getEventType();
      return res.status(StatusCodes.OK).json(eventType);
    } catch (error) {
      console.error("Error fetching event types", error);
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch event types" });
    }
  }

  async toggleListStatus(req: Request, res: Response): Promise<void> {
    try {
      const { eventId } = req.params;
      const updatedEvent = await EventService.toggleEventListing(eventId);
      res.status(StatusCodes.OK).json({ message: 'Listing status updated', event: updatedEvent });
    } catch (err) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Failed to fetch update event status list/unlist" });
    }
  };

  async bookEvent(req: Request, res: Response) {
    try {
      console.log("hit controller bok event");

      const { eventId } = req.body;
      console.log("event id", eventId);

      const { userId } = req.params;
      console.log("userId", userId);

      const sessionUrl = await EventService.bookTicket(userId, eventId);
      console.log("session url", sessionUrl);

      res.json({ sessionUrl });
    } catch (error: any) {
      console.error("Stripe Error:", error);

      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: error.message });
    }
  };


  async updateDescription(req: Request, res: Response) {
    const eventId = req.params.id;
    const { description } = req.body;

    try {
      const updatedEvent = await EventService.updateDescription(eventId, description);
      res.status(StatusCodes.OK).json(updatedEvent);
    } catch (error: any) {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Failed to update description', error: error.message });
    }
  }

  async updateLocation(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    const { location, latitude, longitude } = req.body;

    const user = await EventService.updateLocation(userId as string, location, latitude, longitude);
    res.json(user);
  };


  async getEventsNearUser(req: Request, res: Response) {
    const userId = (req.user as any)?.id;
    const user = await EventService.getUser(userId as string);

    if (!user?.geoLocation?.coordinates?.length) {
      return res.status(StatusCodes.OK).json({ message: 'no_location' });
    }

    const [longitude, latitude] = user.geoLocation.coordinates;

    const events = await EventService.fetchEventsForUserLocation(latitude, longitude);

    if (events.length === 0) {
      return res.status(StatusCodes.OK).json({ message: 'no_events', location: user.location });
    }

    res.json({ location: user.location, events });
  };


}

export default EventController;
