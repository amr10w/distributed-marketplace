using System.Linq;
using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class RemoveFromCartCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly ICartRepository _cartRepository;

        public RemoveFromCartCommandHandler(IUserRepository userRepository, ICartRepository cartRepository)
        {
            _userRepository = userRepository;
            _cartRepository = cartRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /*
             {
                  "CorrelationId": "req-102",
                  "Command": "REMOVE_FROM_CART",
                  "Payload": "{\"UserId\":1,\"ItemId\":5}"
             }

            Payload structure:
             {
                 "UserId": 1,
                 "ItemId": 5,
                 "Quantity": 2
             }
             */
            int userId;
            int itemId;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                userId = root.GetProperty("UserId").GetInt32();
                itemId = root.GetProperty("ItemId").GetInt32();
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "REMOVE_FROM_CART_FAILED", 
                    new 
                    { 
                        Success = false, 
                        Message = "Invalid JSON payload." 
                    });
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "REMOVE_FROM_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var cart = await _cartRepository.GetByUserIdAsync(userId);
            if (cart == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "REMOVE_FROM_CART_FAILED",
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
                    "REMOVE_FROM_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Item not found in cart."
                    });
            }

            cart.Items.Remove(existingItem);
            cart.UpdatedAt = DateTime.UtcNow;

            await _cartRepository.UpdateAsync(cart);

            return BuildResponse(
                request.CorrelationId,
                "REMOVE_FROM_CART_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Item removed from cart successfully."
                });
        }

        private static JsonEnvelope BuildResponse (string correlationId, string command, object payload)
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
