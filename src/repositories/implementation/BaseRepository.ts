import { Model, Document } from "mongoose";
import { IBaseRepository } from "../interface/IBaseRepository";

export class BaseRepository<T extends Document> implements IBaseRepository<T> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async create(data: Partial<T>): Promise<T> {
    return await this.model.create(data);
  }

  async findById(id: string): Promise<T | null> {
    return await this.model.findById(id);
  }

  async findOne(query: object): Promise<T | null> {
    return await this.model.findOne(query);
  }

  async findAll(): Promise<T[]> {
    return await this.model.find();
  }

  async update(id: string, data: Partial<T>): Promise<T | null> {
    return await this.model.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<T | null> {
    return await this.model.findByIdAndDelete(id);
  }

  async toggleBlock(id: string): Promise<T | null> {
    const entity = await this.model.findById(id);
    if (!entity) return null;

    (entity as any).isBlocked = !(entity as any).isBlocked;
    return await entity.save();
  }
}
