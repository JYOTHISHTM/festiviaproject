import { AdminModel } from "../../models/Admin";
import { IAdmin } from "../../models/Admin";
import { IAdminRepository } from "../interface/IAdminRepository";
import Subscription, { ISubscription } from "../../models/Subscription";
import Creator from "../../models/Creator";


class AdminRepository implements IAdminRepository {

async updateCreatorStatusToPending(creatorId: string): Promise<any> {
  return await Creator.findByIdAndUpdate(
    creatorId,
    {
      status: 'pending',
      rejectionReason: null,
    },
    { new: true }
  );
}


  async findByUsername(username: string): Promise<IAdmin | null> {
    return await AdminModel.findOne({ username, isAdmin: true }).lean();
  }
  async findByRefreshToken(refreshToken: string) {
    return await AdminModel.findOne({ refreshToken });
  }

  async updateRefreshToken(adminId: string, refreshToken: string): Promise<void> {
    await AdminModel.updateOne({ _id: adminId }, { refreshToken });
  }

  async clearRefreshToken(adminId: string): Promise<void> {
    await AdminModel.updateOne({ _id: adminId }, { refreshToken: "" });
  }

  
async deleteSubscription  (id: string)  {
  return Subscription.findByIdAndDelete(id);
};

  async getFixedSubscriptionPlan(): Promise<ISubscription[]> {
    return await Subscription.find();
  }

   async create(data: any) {
    return new Subscription(data).save();
  }

}




export default new AdminRepository();
