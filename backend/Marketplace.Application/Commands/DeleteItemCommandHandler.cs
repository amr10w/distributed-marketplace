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
    public class DeleteItemCommandHandler
    {
        private readonly IItemRepository _itemRepository;
        private readonly IStoreRepository _storeRepository;

        public DeleteItemCommandHandler(IItemRepository itemRepository, IStoreRepository storeRepository)
        {
            _itemRepository = itemRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            // 1. Deserialize request payload into DTO
            var payload = JsonSerializer.Deserialize<DeleteItemPayload>(request.Payload);

            if (payload is null || payload.ItemId <= 0)
            {
                return new JsonEnvelope
                {
                    Command = "DELETE_ITEM_FAILED",
                    CorrelationId = request.CorrelationId,
                    Payload = JsonSerializer.Serialize(new
                    {
                        Success = false,
                        Message = "Invalid payload"
                    })
                };
            }

            // 2. Get item from repository
            var item = await _itemRepository.GetByIdAsync(payload.ItemId) ?? throw new ItemNotFoundException(payload.ItemId);
            var store = await _storeRepository.GetByIdAsync(item.StoreId) ?? throw new Exception("Store not found");

            // 3.1 Soft delete (option 1) - mark item as unavailable

            // 3.2 Hard delete (option 2) - remove item from repository
            if (store.OwnerId != payload.RequestingUserId)
            {
                return new JsonEnvelope
                {
                    Command = "DELETE_ITEM_FAILED",
                    CorrelationId = request.CorrelationId,
                    Payload = JsonSerializer.Serialize(new { Success = false, Message = "Unauthorized" })
                };
            }
            //await _itemRepository.DeleteAsync(payload.ItemId);

            item.Status = ItemStatus.removed;
            await _itemRepository.UpdateAsync(item);

            // 4. Return success response
            return new JsonEnvelope
            {
                Command = "DELETE_ITEM_SUCCESS",
                CorrelationId = request.CorrelationId,
                Payload = JsonSerializer.Serialize(new
                {
                    Success = true,
                    ItemId = item.ItemId
                })
            };
        }
    }
    public record DeleteItemPayload(int ItemId, int RequestingUserId);
}
