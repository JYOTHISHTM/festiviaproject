import { IUser } from "../models/User"; 

export const userDTO = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isVerified: user.isVerified,
  isBlocked: user.isBlocked
});
