using MarketPlace.Application.Commands;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class SearchItemsQueryHandler
    {
        private readonly IItemRepository _itemRepository;

        public SearchItemsQueryHandler(IItemRepository itemRepository)
        {
            _itemRepository = itemRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            // 1. Deserialize request.Payload to get the search terms.
            var payload = JsonSerializer.Deserialize<SearchItemPayload>(request.Payload);
            if (payload is null || string.IsNullOrWhiteSpace(payload.SearchTerm))
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "SEARCH_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid search term" })
                };
            }

            // 2. Await _itemRepository.SearchAvailableItemsAsync(searchTerm).
            var items = await _itemRepository.SearchAvailableItemsAsync(payload.SearchTerm);

            // 3. Serialize the search results array into JSON.
            // 4. Return a "SEARCH_RESULTS" JsonEnvelope.
            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "SEARCH_ITEMS_SUCCESS",
                Payload = JsonSerializer.Serialize(new
                {
                    Items = items
                })
            };
        }
    }
    public record SearchItemPayload(string SearchTerm);
}