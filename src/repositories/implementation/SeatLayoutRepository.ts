import SeatLayoutModel, { ISeatLayout, SeatLayoutDocument } from '../../models/SeatLayoutModel';

export class SeatLayoutRepository {
  async save(layout: ISeatLayout): Promise<SeatLayoutDocument> {
  return await SeatLayoutModel.create(layout);
}

  async findAll(): Promise<SeatLayoutDocument[]> {
    return await SeatLayoutModel.find();
  }
}
