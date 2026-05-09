using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetChatHistoryQuery
    {
        public int UserAId { get; set; }
        public int UserBId { get; set; }
    }

    public class GetChatHistoryQueryHandler
    {
        private readonly IMessageRepository _messageRepository;

        public GetChatHistoryQueryHandler(IMessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public async Task<IEnumerable<Message>> HandleAsync(GetChatHistoryQuery query)
        {
            return await _messageRepository.GetChatHistoryAsync(query.UserAId, query.UserBId);
        }
    }
}
