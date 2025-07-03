// services/implementation/SeatLayoutService.ts
import { ISeatLayout, SeatLayoutDocument } from '../../models/SeatLayoutModel';
import { SeatLayoutRepository } from '../../repositories/implementation/SeatLayoutRepository';
import SeatLayoutModel from '../../models/SeatLayoutModel';
export class SeatLayoutService {
  constructor(private repository: SeatLayoutRepository) {}

 async createLayout(data: Omit<ISeatLayout, 'createdAt'>): Promise<SeatLayoutDocument> {
  const newLayout: ISeatLayout = {
    ...data,
    createdAt: new Date(),
    isUsed: false,
  };
  return this.repository.save(newLayout);
}

  async getAllLayouts(): Promise<SeatLayoutDocument[]> {
    return this.repository.findAll();
  }

async getLayoutsByCreatorId(creatorId: string): Promise<SeatLayoutDocument[]> {
  return await SeatLayoutModel.find({ creatorId, isUsed: false }); 
}




}
