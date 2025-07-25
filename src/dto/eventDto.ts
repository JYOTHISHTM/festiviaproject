import { IEvent } from "../models/Event"; 

export const eventDTO = (event: IEvent) => ({
  _id: event._id, 
  eventName: event.eventName,
  eventType: event.eventType,
  date: event.date,
  time: event.time,
  location: event.location,
  image: event.image
});
