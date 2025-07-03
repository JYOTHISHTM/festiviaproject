import { Request, Response } from 'express';
import { Ticket } from '../../models/Ticket';
import Event from '../../models/Event';
import mongoose from 'mongoose';
import TicketService from '../../services/implementation/TicketService';
import { StatusCodes } from "../../enums/StatusCodes";



class TicketController {

  static async getUsersWhoBoughtTickets(req: Request, res: Response): Promise<void> {
    try {
        const { creatorId, page = '1', limit = '7' } = req.query;
        if (!creatorId || typeof creatorId !== 'string' || !mongoose.Types.ObjectId.isValid(creatorId)) {
            res.status(StatusCodes.BAD_REQUEST).json({ message: 'Invalid or missing creatorId' });
            return;
        }

        const pageNumber = parseInt(page as string);
        const limitNumber = parseInt(limit as string);
        const skip = (pageNumber - 1) * limitNumber;

        const creatorEvents = await Event.find({ creatorId }).select('_id');
        const eventIds = creatorEvents.map(event => event._id);

        const tickets = await Ticket.find({ eventId: { $in: eventIds } })
            .populate('userId', 'name email')
            .populate('eventId', 'eventName createdAt')
            .sort({ createdAt: -1 }) // Optional: newest first
            .skip(skip)
            .limit(limitNumber)
            .exec();

        const totalCount = await Ticket.countDocuments({ eventId: { $in: eventIds } });

        const results = tickets
            .filter(ticket => ticket.userId && ticket.eventId)
            .map(ticket => ({
                name: (ticket.userId as any).name,
                email: (ticket.userId as any).email,
                eventName: (ticket.eventId as any).eventName,
                amount: ticket.price,
                createdAt: ticket.createdAt.toISOString(),
            }));

        res.json({
            users: results,
            totalPages: Math.ceil(totalCount / limitNumber),
            currentPage: pageNumber,
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
}
static async getTicketSummary(req: Request, res: Response): Promise<Response> {
    try {
        const { creatorId, selectedEventId, page = "1", limit = "2" } = req.query;
        
        if (!creatorId || typeof creatorId !== "string") {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "creatorId is required" });
        }

        const numericPage = parseInt(page as string);
        const numericLimit = parseInt(limit as string);
        
        const summary = await TicketService.getTicketSummary(
            creatorId, 
            selectedEventId as string, 
            numericPage, 
            numericLimit
        );
        
        return res.status(StatusCodes.OK).json({ success: true, summary });
    } catch (error) {
        console.error("Ticket Summary Error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Internal server error" });
    }
}



}


export default TicketController;
