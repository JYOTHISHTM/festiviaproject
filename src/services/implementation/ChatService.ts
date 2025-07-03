import { ChatRepository } from "../../repositories/implementation/ChatRepository";
import User from "../../models/User";

export class ChatService {
  constructor(private chatRepository: ChatRepository) {}



 async saveMessage(
    roomId: string,
    sender: string,
    message: string,
    userId?: string,
    creatorId?: string,
    mediaType?: string,
    mediaUrl?: string,
    mediaName?: string,
    mediaSize?: number,
    replyTo?: {
      messageId: string;
      message: string;
      sender: string;
      mediaType?: string;
      mediaName?: string;
    }
  ) {
    try {
      if (replyTo) {
        const originalMessage = await this.chatRepository.findMessageById(replyTo.messageId);
        if (!originalMessage) {
          throw new Error('Original message not found for reply');
        }
        
        if (originalMessage.roomId !== roomId) {
          throw new Error('Cannot reply to message from different room');
        }
      }

      const messageData = {
        roomId,
        sender,
        message,
        userId,
        creatorId,
        mediaType: mediaType || null,
        mediaUrl: mediaUrl || null,
        mediaName: mediaName || null,
        mediaSize: mediaSize || null,
        replyTo: replyTo || null
      };

      const savedMessage = await this.chatRepository.saveMessage(messageData);
      return savedMessage;
    } catch (error) {
      console.error("Error in ChatService.saveMessage:", error);
      throw error;
    }
  }

  async getChatHistory(roomId: string) {
    return await this.chatRepository.getMessagesByRoomId(roomId);
  }
  async getChatHistoryForCreator(roomId: string) {
    return await this.chatRepository.getMessagesByRoomIdForCreator(roomId);
  }

  async getChatsForUser(userId: string) {
    return await this.chatRepository.getUniqueChats(userId);
  }
  async getChatsForCreator(creatorId: string) {
    return await this.chatRepository.getUniqueChatsForCreator(creatorId);
  }

  static generateRoomId(userId: string, creatorId: string) {
    const sortedIds = [userId, creatorId].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }

   async getUsersWhoMessagedCreator(creatorId: string) {
    const senderIds = await this.chatRepository.getUniqueSendersForCreator(creatorId);
    const users = await User.find({ _id: { $in: senderIds } });
    return users;
  }
}