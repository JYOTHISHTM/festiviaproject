
export interface IEventService {
    getEventById(id: string): Promise<any>;
    getAllEvents(filters: any, skip: number, limit: number): Promise<any>;
  }
  