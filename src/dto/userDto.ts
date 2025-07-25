import { IUser } from "../models/User"; 

export const userDTO = (user: IUser) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  isBlocked: user.isBlocked,
  isVerified: user.isVerified,
});
