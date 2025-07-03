import TicketRepository from '../../repositories/implementation/TicketRepository';

const getTicketSummary = async (creatorId: string, selectedEventId?: string, page?: number, limit?: number) => {
    return await TicketRepository.getTicketSummaryByCreator(creatorId, selectedEventId, page, limit);
};

export default {
  getTicketSummary,
};
