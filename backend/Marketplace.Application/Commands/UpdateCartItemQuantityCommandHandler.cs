using System;
using System.Linq;
using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class UpdateCartItemQuantityCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IItemRepository _itemRepository;

        public UpdateCartItemQuantityCommandHandler(IUserRepository userRepository, ICartRepository cartRepository, IItemRepository itemRepository)
        {
            _userRepository = userRepository;
            _cartRepository = cartRepository;
            _itemRepository = itemRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /*
            {
              "CorrelationId": "req-103",
              "Command": "UPDATE_CART_ITEM_QUANTITY",
              "Payload": "{\"UserId\":1,\"ItemId\":5,\"Quantity\":4}"
            }

            Payload structure:
            {
              "UserId": 1,
              "ItemId": 5,
              "Quantity": 4
            }
             */
            int userId;
            int itemId;
            int quantity;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                userId = root.GetProperty("UserId").GetInt32();
                itemId = root.GetProperty("ItemId").GetInt32();
                quantity = root.GetProperty("Quantity").GetInt32();
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid JSON payload."
                    });
            }
            if (quantity <= 0)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Quantity must be greater than zero."
                    });
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var item = await _itemRepository.GetByIdAsync(itemId);
            if (item == null || !item.IsAvailable)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Item not found or unavailable."
                    });
            }
            if (item.StockQuantity < quantity)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Not enough stock available."
                    });
            }

            var cart = await _cartRepository.GetByUserIdAsync(userId);
            if (cart == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Cart not found."
                    });
            }

            var existingItem = cart.Items.FirstOrDefault(ci => ci.ItemId == itemId);
            if (existingItem == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "UPDATE_CART_ITEM_QUANTITY_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Item not found in cart."
                    });
            }

            existingItem.Quantity = quantity;
            cart.UpdatedAt = DateTime.UtcNow;

            await _cartRepository.UpdateAsync(cart);

            return BuildResponse(
                request.CorrelationId,
                "UPDATE_CART_ITEM_QUANTITY_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Item quantity updated successfully."
                });
        }

        private static JsonEnvelope BuildResponse(string correlationId, string command, object payload)
        {
            return new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = command,
                Payload = JsonSerializer.Serialize(payload)
            };
        }
    }
}
