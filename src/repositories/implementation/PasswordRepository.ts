import User from '../../models/User';

export class PasswordRepository {
  async findUserById(userId: string) {
    return await User.findById(userId);
  }

  async updatePassword(userId: string, hashedPassword: string) {
    return await User.findByIdAndUpdate(userId, { password: hashedPassword });
  }
}
