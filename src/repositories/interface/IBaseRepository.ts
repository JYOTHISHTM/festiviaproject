import { Document } from "mongoose";

export interface IBaseRepository<T extends Document> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(query: object): Promise<T | null>;
  findAll(): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<T | null>;
  toggleBlock(id: string): Promise<T | null>;
}
