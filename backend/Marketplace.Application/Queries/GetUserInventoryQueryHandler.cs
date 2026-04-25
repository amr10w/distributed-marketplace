using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetUserInventoryQueryHandler
    {
        private readonly IItemRepository _itemRepository;

        public GetUserInventoryQueryHandler(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            // 1. Deserialize request.Payload to get the UserId.
            var payload = JsonSerializer.Deserialize<GetUserInventoryPayload>(request.Payload);
            if (payload is null || payload.OwnerId == 0) // Zero is the supposed to be the value of empty ID (Default value).
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_INVENTORY_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid Owner ID" })
                };
            }

            // 2. Await _itemRepository.GetItemsByOwnerIdAsync(userId).
            var items = await _itemRepository.GetItemsByOwnerIdAsync(payload.OwnerId);

            // 3. Serialize the list of items into a JSON string.
            // 4. Return an "INVENTORY_RESULTS" JsonEnvelope containing the serialized array.
            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_INVENTORY_SUCCESS",
                Payload = JsonSerializer.Serialize(new
                {
                    Items = items
                })
            };
        }
    }
    public record GetUserInventoryPayload(int OwnerId);
}