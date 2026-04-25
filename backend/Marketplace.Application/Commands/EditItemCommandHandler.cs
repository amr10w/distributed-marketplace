using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Exceptions;
using MarketPlace.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Commands
{
    public class EditItemCommandHandler
    {
        private readonly IItemRepository _itemRepository;
        private readonly IStoreRepository _storeRepository;

        public EditItemCommandHandler(IItemRepository items, IStoreRepository storeRepository)
        {
            _itemRepository = items;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            // 1. Deserialize request.Payload into EditItemPayload DTO
            var payload = JsonSerializer.Deserialize<EditItemPayload>(request.Payload);

            if (payload is null || payload.ItemId <= 0)
            {
                return new JsonEnvelope
                {
                    Command = "EDIT_ITEM_FAILED",
                    CorrelationId = request.CorrelationId,
                    Payload = JsonSerializer.Serialize(new { Success = false, Message = "Invalid payload" })
                };
            }

            // 2. Retrieve item from repository
            var item = await _itemRepository.GetByIdAsync(payload.ItemId) ?? throw new ItemNotFoundException(payload.ItemId);
            var store = await _storeRepository.GetByIdAsync(item.StoreId) ?? throw new Exception("Store not found");

            // 3. Update only fields that were provided (partial update)
            item.Name = payload.Name ?? item.Name;
            item.Description = payload.Description ?? item.Description;
            item.Price = payload.Price ?? item.Price;
            item.Status = payload.Status ?? item.Status;

            // 4. Save updated item
            if (store.OwnerId != payload.RequestingUserId)
            {
                return new JsonEnvelope
                {
                    Command = "EDIT_ITEM_FAILED",
                    CorrelationId = request.CorrelationId,
                    Payload = JsonSerializer.Serialize(new { Success = false, Message = "Unauthorized" })
                };
            }

            await _itemRepository.UpdateAsync(item);
            // 5. Return success response envelope
            return new JsonEnvelope
            {
                Command = "EDIT_ITEM_SUCCESS",
                CorrelationId = request.CorrelationId,
                Payload = JsonSerializer.Serialize(new
                {
                    Success = true,
                    ItemId = item.ItemId
                })
            };
        }
    }

    public record EditItemPayload(
        int ItemId,
        int RequestingUserId,
        string? Name,
        string? Description,
        decimal? Price,
        ItemStatus? Status
    );
}
