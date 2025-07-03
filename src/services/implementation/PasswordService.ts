import bcrypt from 'bcryptjs';
import { PasswordRepository } from '../../repositories/implementation/PasswordRepository';

export class PasswordService {
  constructor(private passwordRepo: PasswordRepository) {}

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.passwordRepo.findUserById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    if (!user.password) {
        throw new Error("Password not set for user");
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
        throw new Error("Current password is incorrect");
    }

    console.log("Service: Hashing new password for userId:", userId);
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    console.log("Service: Updating password for userId:", userId);
    await this.passwordRepo.updatePassword(userId, hashedPassword);
}
}
