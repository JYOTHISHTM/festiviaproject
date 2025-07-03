import { IAdmin } from "../../models/Admin";
import {ISubscription} from "../../models/Subscription";

export interface IAdminRepository {
  findByUsername(username: string): Promise<IAdmin | null>;
  findByRefreshToken(refreshToken: string): Promise<IAdmin | null>;
  updateRefreshToken(adminId: string, refreshToken: string): Promise<void>;
  clearRefreshToken(adminId: string): Promise<void>; 
  updateCreatorStatusToPending(creatorId: string): Promise<any>; 
  getFixedSubscriptionPlan(): Promise<ISubscription []>;
create(data:any):Promise<any>
deleteSubscription(id:string):Promise<any>
}
