import { Message } from "../../models/Message";
import { Types } from "mongoose";

export class ChatRepository {

 async saveMessage(messageData: {
    roomId: string;
    sender: string;
    message: string;
    userId?: string;
    creatorId?: string;
    mediaType?: string | null;
    mediaUrl?: string | null;
    mediaName?: string | null;
    mediaSize?: number | null;
    replyTo?: {
      messageId: string;
      message: string;
      sender: string;
      mediaType?: string;
      mediaName?: string;
    } | null;
  }) {
    try {
      const message = new Message(messageData);
      const savedMessage = await message.save();
      return savedMessage;
    } catch (error) {
      console.error("Error in ChatRepository.saveMessage:", error);
      throw error;
    }
  }


  async findMessageById(messageId: string) {
    try {
      const message = await Message.findById(messageId)
        .populate('userId', 'name email')
        .populate('creatorId', 'name email');

      return message;
    } catch (error) {
      console.error("Error in ChatRepository.findMessageById:", error);
      throw error;
    }
  }


  async getMessagesByRoomId(roomId: string) {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    console.log("Fetched messages for roomId:", roomId, messages);
    return messages;
  }
  async getMessagesByRoomIdForCreator(roomId: string) {
    const messages = await Message.find({ roomId }).sort({ timestamp: 1 });
    console.log("Fetched messages for roomId:", roomId, messages);
    return messages;
  }


  async getUniqueChats(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const uniqueChats = await Message.aggregate([
      {
        $match: {
          $or: [
            { userId: userObjectId },
            { creatorId: userObjectId }
          ]
        }
      },
      {
        $addFields: {
          chatWith: {
            $cond: [
              { $eq: ["$userId", userObjectId] },
              "$creatorId",
              "$userId"
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chatWith",
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$createdAt" },
          roomId: { $first: "$roomId" }
        }
      },
      {
        $lookup: {
          from: "creators",
          localField: "_id",
          foreignField: "_id",
          as: "creatorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          timestamp: 1,
          roomId: 1,
          creatorName: { $arrayElemAt: ["$creatorInfo.name", 0] }
        }
      }
    ]);

    return uniqueChats;
  }


  async getUniqueChatsForCreator(creatorId: string) {
    const creatorObjectId = new Types.ObjectId(creatorId);

    const uniqueChats = await Message.aggregate([
      {
        $match: {
          $or: [
            { userId: creatorObjectId },
            { creatorId: creatorObjectId }
          ]
        }
      },
      {
        $addFields: {
          chatWith: {
            $cond: [
              { $eq: ["$userId", creatorObjectId] },
              "$creatorId",
              "$userId"
            ]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$chatWith",
          lastMessage: { $first: "$message" },
          timestamp: { $first: "$createdAt" },
          roomId: { $first: "$roomId" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo"
        }
      },
      {
        $lookup: {
          from: "creators",
          localField: "_id",
          foreignField: "_id",
          as: "creatorInfo"
        }
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          timestamp: 1,
          roomId: 1,
          nameFromUser: { $arrayElemAt: ["$userInfo.name", 0] },
          nameFromCreator: { $arrayElemAt: ["$creatorInfo.name", 0] },
          displayName: {
            $ifNull: [
              { $arrayElemAt: ["$userInfo.name", 0] },
              { $arrayElemAt: ["$creatorInfo.name", 0] }
            ]
          }
        }
      }
    ]);

    return uniqueChats.map(chat => ({
      ...chat,
      creatorName: chat.displayName 
    }));
  }



  async getUniqueSendersForCreator(creatorId: string) {
    return await Message.distinct('sender', { receiver: creatorId });
  }

}