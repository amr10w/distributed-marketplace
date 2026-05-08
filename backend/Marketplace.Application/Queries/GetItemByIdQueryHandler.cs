using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetItemByIdQueryHandler
    {
        private readonly IItemRepository _itemRepository;
        private readonly IStoreRepository _storeRepository;

        public GetItemByIdQueryHandler(IItemRepository itemRepository, IStoreRepository storeRepository)
        {
            _itemRepository = itemRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            var payload = JsonSerializer.Deserialize<GetItemByIdPayload>(request.Payload);
            if (payload is null || payload.ItemId <= 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid item ID" })
                };
            }

            var item = await _itemRepository.GetByIdAsync(payload.ItemId);
            if (item is null)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Item not found" })
                };
            }

            var store = await _storeRepository.GetByIdAsync(item.StoreId);

            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_ITEM_SUCCESS",
                Payload = JsonSerializer.Serialize(new
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
                })
            };
        }
    }

    public record GetItemByIdPayload(int ItemId);
}
