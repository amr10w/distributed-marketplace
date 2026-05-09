using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        private readonly AppDbContext _context;

        public MessageRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task AddAsync(Message message)
        {
            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Message>> GetChatHistoryAsync(int userAId, int userBId)
        {
            // Fetch messages where UserA sent to UserB OR UserB sent to UserA
            return await _context.Messages
                .Where(m => (m.SenderId == userAId && m.ReceiverId == userBId) ||
                            (m.SenderId == userBId && m.ReceiverId == userAId))
                .OrderBy(m => m.SentAt) // Sort chronologically so the chat reads top-to-bottom
                .ToListAsync();
        }
    }
}
