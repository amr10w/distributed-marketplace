using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetAllItemsQueryHandler
    {
        private readonly IItemRepository _itemRepository;
        private readonly IStoreRepository _storeRepository;

        public GetAllItemsQueryHandler(IItemRepository itemRepository, IStoreRepository storeRepository)
        {
            _itemRepository = itemRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            var items = (await _itemRepository.GetAllAvailableAsync()).ToList();
            var storeMap = (await _storeRepository.GetAllAsync())
                .ToDictionary(s => s.StoreId);

            var enriched = items.Select(item =>
            {
                storeMap.TryGetValue(item.StoreId, out var store);
                return new
                {
                    item.ItemId,
                    item.StoreId,
                    StoreName = store?.StoreName ?? "",
                    SellerId = store?.OwnerId ?? 0,
                    item.CategoryId,
                    item.Name,
                    item.Brand,
                    item.Description,
                    item.Price,
                    item.StockQuantity,
                    item.ImageUrl,
                    Status = item.Status.ToString(),
                    item.CreatedAt,
                    item.UpdatedAt,
                };
            }).ToList();

            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_ALL_ITEMS_SUCCESS",
                Payload = JsonSerializer.Serialize(new { Items = enriched })
            };
        }
    }
}
