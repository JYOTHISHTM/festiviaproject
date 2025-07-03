import { IUser } from "../../models/User";
import { IBaseRepository } from "./IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  blockUser(userId: string): Promise<IUser | null>;
  logout(userId: string): Promise<{ message: string }>;
  findByEmail(email: string): Promise<IUser | null>;
  countUsers(): Promise<number>;

}
