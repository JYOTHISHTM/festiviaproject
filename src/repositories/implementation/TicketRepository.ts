import mongoose from "mongoose";
import { Ticket } from "../../models/Ticket"
import SeatLayoutModel from '../../models/SeatLayoutModel';

const getTicketSummaryByCreator = async (creatorId: string, selectedEventId?: string, page: number = 1, limit: number = 2) => {
    const skip = (page - 1) * limit;

    return await Ticket.aggregate([
        {
            $lookup: {
                from: "events",
                localField: "eventId",
                foreignField: "_id",
                as: "event"
            }
        },
        { $unwind: "$event" },
        {
            $match: {
                "event.creatorId": new mongoose.Types.ObjectId(creatorId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        {
            $sort: { createdAt: -1 } // Sort by newest first
        },
        {
            $group: {
                _id: "$event._id",
                eventName: { $first: "$event.eventName" },
                eventImage: { $first: "$event.image" },
                ticketsSold: { $sum: 1 },
                totalRevenue: { $sum: "$price" },
                allBuyers: {
                    $push: {
                        name: "$user.name",
                        email: "$user.email",
                        price: "$price",
                        createdAt: "$createdAt"
                    }
                }
            }
        },
        {
            $addFields: {
                buyers: {
                    $cond: {
                        if: selectedEventId ? { $eq: ["$_id", new mongoose.Types.ObjectId(selectedEventId)] } : { $eq: [1, 1] }, 
                        then: { $slice: ["$allBuyers", skip, limit] },
                        else: []
                    }
                },
                totalBuyers: { $size: "$allBuyers" },
                totalPages: {
                    $cond: {
                        if: selectedEventId ? { $eq: ["$_id", new mongoose.Types.ObjectId(selectedEventId)] } : { $eq: [1, 1] },
                        then: { $ceil: { $divide: [{ $size: "$allBuyers" }, limit] } },
                        else: 0
                    }
                },
                currentPage: {
                    $cond: {
                        if: selectedEventId ? { $eq: ["$_id", new mongoose.Types.ObjectId(selectedEventId)] } : { $eq: [1, 1] },
                        then: page,
                        else: 0
                    }
                },
                isSelected: {
                    $cond: {
                        if: selectedEventId ? { $eq: ["$_id", new mongoose.Types.ObjectId(selectedEventId)] } : { $eq: [1, 1] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                allBuyers: 0 
            }
        },
        { $sort: { eventName: 1 } }
    ]);
};






export const markSeatAsBooked = async (seatLayoutId: string, seatNumber: string) => {
    console.log("seatLayoutId",seatLayoutId,"seatNumber",seatNumber);
    
  return SeatLayoutModel.updateOne(
    { _id: seatLayoutId, "seats.seatNumber": seatNumber },
    { $set: { "seats.$.isBooked": true } }
  );
};
export default {
    getTicketSummaryByCreator,
};
