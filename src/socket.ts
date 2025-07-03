import { Server as SocketIOServer } from "socket.io";
import { Message } from "./models/Message";
import { ChatService } from "./services/implementation/ChatService";
import { ChatRepository } from "./repositories/implementation/ChatRepository";

const chatService = new ChatService(new ChatRepository());

// Updated Socket Handler - setupSocket.ts
export const setupSocket = (io: SocketIOServer) => {
  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
      socket.to(roomId).emit("user-online", true);
    });

    socket.on("leave-room", (roomId: string) => {
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left room ${roomId}`);
      socket.to(roomId).emit("user-offline", false);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      const rooms = Array.from(socket.rooms).filter((r) => r !== socket.id);
      rooms.forEach((roomId) => {
        socket.to(roomId).emit("user-offline", false);
      });
    });

    socket.on("typing", (roomId: string) => {
      console.log(`Socket ${socket.id} is typing in room ${roomId}`);
      socket.to(roomId).emit("user-typing");
    });

    socket.on("stopTyping", (roomId: string) => {
      console.log(`Socket ${socket.id} stopped typing in room ${roomId}`);
      socket.to(roomId).emit("user-stopTyping");
    });


    
    socket.on("send-message", async (data) => {
      const {
        roomId,
        message,
        sender,
        userId,
        creatorId,
        mediaType,
        mediaUrl,
        mediaName,
        mediaSize,
        replyTo, 
      } = data;

      try {
        if (!message && !mediaUrl) {
          socket.emit("error", { message: "Either message text or media must be provided" });
          return;
        }

        if (mediaType && !mediaUrl) {
          socket.emit("error", { message: "Media URL is required when media type is specified" });
          return;
        }

        if (mediaUrl && !mediaType) {
          socket.emit("error", { message: "Media type is required when media URL is provided" });
          return;
        }

        console.log("Saving message with data:", {
          roomId,
          sender,
          message: message || "[Media]",
          mediaType,
          mediaUrl,
          mediaName,
          mediaSize,
          replyTo
        });

        const savedMessage = await chatService.saveMessage(
          roomId,
          sender,
          message || "", 
          userId,
          creatorId,
          mediaType,
          mediaUrl,
          mediaName,
          mediaSize,
          replyTo 
        );

        io.to(roomId).emit("receive-message", {
          _id: savedMessage._id,
          message: message || "",
          sender,
          timestamp: new Date(),
          mediaType,
          mediaUrl,
          mediaName,
          mediaSize,
          replyTo, 
        });
        
        console.log(`Message sent to room ${roomId}`, {
          hasText: !!message,
          hasMedia: !!mediaUrl,
          isReply: !!replyTo
        });
        
      } catch (error) {
        console.error("Error sending message:", error);
        socket.emit("error", { 
          message: "Failed to send message",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });

    socket.on("check-online-status", (roomId: string) => {
      const room = io.sockets.adapter.rooms.get(roomId);
      const isOnline = room && room.size > 1;
      socket.emit("online-status", isOnline);
    });
  });
};