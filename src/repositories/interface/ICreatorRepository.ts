import { ICreator } from "../../models/Creator";
import { IEvent } from "../../models/Event";
import { IBaseRepository } from "./IBaseRepository";

export interface ICreatorRepository extends IBaseRepository<ICreator> {
  blockCreator(creatorId: string): Promise<ICreator | null>;
  createEvent(eventData: Partial<IEvent>): Promise<IEvent>;
  findByEmail(email: string): Promise<ICreator | null>
  updateRefreshToken(id: string, refreshToken: string): Promise<void>;
  clearRefreshToken(id: string): Promise<void>;
  findByRefreshToken(refreshToken: string): Promise<any>;
  clearRefreshToken(creatorId: string): Promise<void>;
  findById(creatorId: string): Promise<any>;
  findPendingCreators():Promise<any>
  approveCreator(creatorId: string):Promise<any>
  rejectCreator(creatorId: string, rejectionReason: string):Promise<any>
  getCreatorStatus(creatorId: string):Promise<any>
  countCreators():Promise<any>
  countPendings():Promise<any>
}
