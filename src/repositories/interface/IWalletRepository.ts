import { IUser } from "../../models/User";

export interface ICreatorRepository<IUser> {

  getUserById(userId: string): Promise<any>;
  updateWallet(userId: string, amount: number): Promise<any>;
}
