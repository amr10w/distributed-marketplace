using System;
using System.Collections.Generic;
using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Queries
{
    public class GetUserCartQueryHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly ICartRepository _cartRepository;
        private readonly IItemRepository _itemRepository;

        public GetUserCartQueryHandler(IUserRepository userRepository, ICartRepository cartRepository, IItemRepository itemRepository)
        {
            _userRepository = userRepository;
            _cartRepository = cartRepository;
            _itemRepository = itemRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /*
            {
              "CorrelationId": "req-105",
              "Command": "GET_USER_CART",
              "Payload": "{\"UserId\":1}"
            }

            Payload structure:
            {
              "UserId": 1
            }
             */
            int userId;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                userId = root.GetProperty("UserId").GetInt32();
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "GET_USER_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload format."
                    });
            }

            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "GET_USER_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var cart = await _cartRepository.GetByUserIdAsync(userId);

            if (cart == null || cart.Items == null || cart.Items.Count == 0)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "GET_USER_CART_SUCCESS",
                    new
                    {
                        Success = true,
                        Message = "Cart is empty.",
                        CartId = (int?)null,
                        UserId = userId,
                        Status = "Active",
                        TotalItems = 0,
                        TotalAmount = 0m,
                        Items = Array.Empty<object>()
                    });
            }

            var items = new List<object>();
            decimal totalAmount = 0m;
            int totalItems = 0;

            foreach (var cartItem in cart.Items)
            {
                var item = await _itemRepository.GetByIdAsync(cartItem.ItemId);

                if (item == null)
                    continue;

                var lineTotal = item.Price * cartItem.Quantity;
                totalAmount += lineTotal;
                totalItems += cartItem.Quantity;

                items.Add(new
                {
                    CartItemId = cartItem.CartItemId,
                    ItemId = cartItem.ItemId,
                    Name = item.Name,
                    Price = item.Price,
                    Quantity = cartItem.Quantity,
                    LineTotal = lineTotal,
                    StockQuantity = item.StockQuantity,
                    IsAvailable = item.IsAvailable,
                    Status = item.Status.ToString()
                });
            }

            return BuildResponse(
                request.CorrelationId,
                "GET_USER_CART_SUCCESS",
                new
                {
                    Success = true,
                    CartId = cart.CartId,
                    UserId = cart.UserId,
                    Status = cart.Status.ToString(),
                    TotalItems = totalItems,
                    TotalAmount = totalAmount,
                    Items = items
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