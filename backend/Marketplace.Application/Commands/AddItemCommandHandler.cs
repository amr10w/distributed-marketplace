using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Commands
{
    public class AddItemCommandHandler
    {
        private readonly IItemRepository _itemRepository;
        private readonly IStoreRepository _storeRepository;

        public AddItemCommandHandler(IItemRepository itemRepository, IStoreRepository storeRepository)
        {
            _itemRepository = itemRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            // 1. Deserialize request.Payload into an Item DTO (Name, Description, Price, OwnerId).
            var payload = JsonSerializer.Deserialize<AddItemPayload>(request.Payload);

            // 2. Validate the data.
            if (payload is null || payload.RequestingUserId <= 0 || payload.StoreId <= 0 || payload.CategoryId <= 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid payload" })
                };
            }
            if (payload.Price <= 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Price must be greater than 0" })
                };
            }
            if (payload.StockQuantity < 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Stock quantity cannot be negative." })
                };
            }
            if (string.IsNullOrWhiteSpace(payload.Name))
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Name is required" })
                };
            }
            var store = await _storeRepository.GetByIdAsync(payload.StoreId);
            if (store == null) 
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Store not found" })
                };
            }

            if (store.OwnerId != payload.RequestingUserId)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "ADD_ITEM_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Unauthorized" })
                };
            }
            // 3. Map the DTO to a Domain Entity;
            var item = new Item
            {
                StoreId = payload.StoreId, // This would be set based on the OwnerId in a real implementation
                CategoryId = payload.CategoryId,
                Name = payload.Name,
                Price = payload.Price,
                Brand = payload.Brand, // Optional field
                Description = payload.Description,
                StockQuantity = payload.StockQuantity, // Default stock quantity
                ImageUrl = payload.ImageUrl,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow,
                Status = payload.StockQuantity > 0 ? ItemStatus.available : ItemStatus.sold,
            };

            // 4. Await _itemRepository.AddAsync(newItem).
            await _itemRepository.AddAsync(item);

            // 5. Construct and return an "ITEM_ADDED" JsonEnvelope.
            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "ITEM_ADDED",
                Payload = JsonSerializer.Serialize(new
                {
                    Success = true,
                    ItemId = item.ItemId
                })
            };
        }
    }
    public record AddItemPayload(
    int RequestingUserId,
    int StoreId,
    int CategoryId,
    string Name,
    string? Brand,
    string? Description,
    decimal Price,
    int StockQuantity,
    string? ImageUrl
);
}