using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class SendMessageCommand
    {
        public int SenderId { get; set; }
        public int ReceiverId { get; set; }
        public string Content { get; set; } = string.Empty;
    }
    public class SendMessageCommandHandler
    {
        private readonly IMessageRepository _messageRepository;

        public SendMessageCommandHandler(IMessageRepository messageRepository)
        {
            _messageRepository = messageRepository;
        }

        public async Task<Message> HandleAsync(SendMessageCommand command)
        {
            var message = new Message(command.SenderId, command.ReceiverId, command.Content);

            await _messageRepository.AddAsync(message);

            return message;
        }
    }
}
