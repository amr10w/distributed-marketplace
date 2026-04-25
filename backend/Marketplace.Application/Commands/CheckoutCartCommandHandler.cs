using System;
using System.Text.Json;
using System.Collections.Generic;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class CheckoutCartCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IWalletRepository _walletRepository;
        private readonly IItemRepository _itemRepository;
        private readonly ICartRepository _cartRepository;
        private readonly ITransactionRepository _transactionRepository;
        private readonly IStoreRepository _storeRepository;

        public CheckoutCartCommandHandler(IUserRepository userRepository, IWalletRepository walletRepository, IItemRepository itemRepository, ICartRepository cartRepository, ITransactionRepository transactionRepository, IStoreRepository storeRepository)
        {
            _userRepository = userRepository;
            _walletRepository = walletRepository;
            _itemRepository = itemRepository;
            _cartRepository = cartRepository;
            _transactionRepository = transactionRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {

            /*
            {
              "CorrelationId": "req-104",
              "Command": "CHECKOUT_CART",
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
                    "CHECKOUT_CART_FAILED",
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
                    "CHECKOUT_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var cart = await _cartRepository.GetByUserIdAsync(userId);
            if (cart == null || cart.Items.Count == 0)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CHECKOUT_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Cart is empty."
                    });
            }

            var buyerWallet = await _walletRepository.GetByUserIdAsync(userId);
            if (buyerWallet == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CHECKOUT_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Wallet not found."
                    });
            }

            var validatedItems = new List<(CartItem CartItem, Item Item, Store Store)>();
            decimal totalAmount = 0m;

            foreach (var cartItem in cart.Items)
            {
                var item = await _itemRepository.GetByIdAsync(cartItem.ItemId);

                if (item == null || !item.IsAvailable)
                {
                    return BuildResponse(
                        request.CorrelationId,
                        "CHECKOUT_CART_FAILED",
                        new
                        {
                            Success = false,
                            Message = $"Item with ID {cartItem.ItemId} not found or not available."
                        });
                }

                if (item.StockQuantity < cartItem.Quantity)
                {
                    return BuildResponse(
                        request.CorrelationId,
                        "CHECKOUT_CART_FAILED",
                        new
                        {
                            Success = false,
                            Message = $"Not enough stock for item '{item.Name}'."
                        });
                }

                var store = await _storeRepository.GetByIdAsync(item.StoreId);
                if (store == null || !store.IsActive)
                {
                    return BuildResponse(
                        request.CorrelationId,
                        "CHECKOUT_CART_FAILED",
                        new
                        {
                            Success = false,
                            Message = $"Store for item '{item.Name}' not found or inactive."
                        });
                }

                validatedItems.Add((cartItem, item, store));
                totalAmount += item.Price * cartItem.Quantity;
            }

            if (buyerWallet.Balance < totalAmount)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CHECKOUT_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Insufficient wallet balance."
                    });
            }

            buyerWallet.Balance -= totalAmount;
            buyerWallet.UpdatedAt = DateTime.UtcNow;
            await _walletRepository.UpdateAsync(buyerWallet);

            foreach (var val in validatedItems)
            {
                var cartItem = val.CartItem;
                var item = val.Item;
                var store = val.Store;

                var sellerWallet = await _walletRepository.GetByUserIdAsync(store.OwnerId);
                if (sellerWallet == null)
                {
                    return BuildResponse(
                        request.CorrelationId,
                        "CHECKOUT_CART_FAILED",
                        new
                        {
                            Success = false,
                            Message = $"Seller wallet not found for store '{store.StoreName}'."
                        });
                }
                var incomeAmount = item.Price * cartItem.Quantity;
                sellerWallet.Balance += incomeAmount;
                sellerWallet.UpdatedAt = DateTime.UtcNow;

                await _walletRepository.UpdateAsync(sellerWallet);

                item.StockQuantity -= cartItem.Quantity;

                if (item.StockQuantity == 0)
                {
                    item.Status = ItemStatus.sold;
                }

                item.UpdatedAt = DateTime.UtcNow;
                await _itemRepository.UpdateAsync(item);

                var transaction = new Transaction
                {
                    BuyerId = userId,
                    SellerId = store.OwnerId,
                    CategoryId = item.CategoryId,
                    ItemId = item.ItemId,
                    Amount = incomeAmount,
                    TransactionType = TransactionType.Purchase,
                    Status = TransactionStatus.Completed
                };
                await _transactionRepository.AddAsync(transaction);
            }

            cart.Items.Clear();
            cart.Status = CartStatus.checked_out; // can be edited if we want it to stay active for other uses or we can delete the cart entirely
            cart.UpdatedAt = DateTime.UtcNow;

            await _cartRepository.UpdateAsync(cart);

            return BuildResponse(
                request.CorrelationId,
                "CHECKOUT_CART_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Cart checked out successfully.",
                    TotalAmount = totalAmount,
                    RemainingBalance = buyerWallet.Balance
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
