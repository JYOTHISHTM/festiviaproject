import { ICreator } from "../models/Creator"; 

export const creatorDTO = (user: ICreator) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isBlocked: user.isBlocked,
  isVerified: user.isVerified,
});
