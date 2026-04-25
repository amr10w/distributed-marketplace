using System.Linq;
using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class AddToCartCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IItemRepository _itemRepository;
        private readonly ICartRepository _cartRepository;
        public AddToCartCommandHandler(IUserRepository userRepository, IItemRepository itemRepository, ICartRepository cartRepository)
        {
            _userRepository = userRepository;
            _itemRepository = itemRepository;
            _cartRepository = cartRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /*
             {
                  "CorrelationId": "req-101",
                  "Command": "ADD_TO_CART",
                  "Payload": "{\"UserId\":1,\"ItemId\":5,\"Quantity\":2}"
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
                    "ADD_TO_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload format."
                    });
            }
            if (quantity <= 0)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "ADD_TO_CART_FAILED",
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
                    "ADD_TO_CART_FAILED",
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
                    "ADD_TO_CART_FAILED",
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
                    "ADD_TO_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Not enough stock available."
                    });
            }

            var cart = await _cartRepository.GetByUserIdAsync(userId);
            if (cart == null )
            {
                cart = new Cart
                {
                    UserId = userId,
                    Status = CartStatus.active,
                    Items = new List<CartItem>{
                        new CartItem
                        {
                            ItemId = itemId,
                            Quantity = quantity
                        }
                    }
                };

                await _cartRepository.AddAsync(cart);
            }
            else 
            {
                var existingCartItem = cart.Items.FirstOrDefault(ci => ci.ItemId == itemId);
                if (existingCartItem != null)
                {
                    if (item.StockQuantity < existingCartItem.Quantity + quantity)
                    {
                        return BuildResponse(
                            request.CorrelationId,
                            "ADD_TO_CART_FAILED",
                            new
                            {
                                Success = false,
                                Message = "Not enough stock available."
                            });
                    }
                    existingCartItem.Quantity += quantity;
                }
                else
                {
                    if (item.StockQuantity < quantity)
                    {
                        return BuildResponse(
                            request.CorrelationId,
                            "ADD_TO_CART_FAILED",
                            new
                            {
                                Success = false,
                                Message = "Not enough stock available."
                            });
                    }
                    cart.Items.Add(new CartItem
                    {
                        CartId = cart.CartId,
                        ItemId = itemId,
                        Quantity = quantity
                     });
                }
                cart.UpdatedAt = DateTime.UtcNow;
                await _cartRepository.UpdateAsync(cart);
            }
            
            return BuildResponse(
                request.CorrelationId,
                "ADD_TO_CART_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Item added to cart successfully."
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
