import { IEvent } from "../models/Event"; 

export const homeEventDTO = (event: IEvent) => ({
  _id: event._id,
  eventName: event.eventName,
  eventType: event.eventType,
  date: event.date,
  time: event.time,
  location: event.location,
  image: event.image,
  price: event.price
});
