export interface IAdminService {
  getUsers(): Promise<any>;
  getCreators(): Promise<any>;
  blockUser(userId: string): Promise<any>;
  blockCreator(creatorId: string): Promise<any>;
  login(username: string, password: string): Promise<{
    token: string;
    refreshToken: string;
    admin: { _id: string; username: string }
  }>;

  refreshToken(refreshToken: string): Promise<string | null>;
  logout(refreshToken: string): Promise<void>;

  getPendingCreators(): Promise<any>
  approveCreator(creatorId: string): Promise<any>
  rejectCreator(creatorId: string, rejectionReason: string): Promise<any>
  getCreatorStatus(creatorId: string): Promise<any>
  getSubscriptionPlan(): Promise<any>
  createSubscription(subscriptionData:any):Promise<any>
  handleCreatorReapply(creatorId: string): Promise<any>;
  getDashboardData(): Promise<any>;
  deleteSubscription(id:string):Promise<any>
}
