// services/interface/IWalletService.ts
export interface IWalletService {
  addMoney(userId: string, amount: number): Promise<any>;
}
