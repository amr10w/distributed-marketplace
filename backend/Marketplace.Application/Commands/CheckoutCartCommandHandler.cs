using System;
using System.Linq;
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
        private readonly IReportLogRepository _reportLogRepository;
        private readonly IUnitOfWork _unitOfWork;

        public CheckoutCartCommandHandler(IUserRepository userRepository, IWalletRepository walletRepository, IItemRepository itemRepository, ICartRepository cartRepository, ITransactionRepository transactionRepository, IStoreRepository storeRepository, IReportLogRepository reportLogRepository, IUnitOfWork unitOfWork)
        {
            _userRepository = userRepository;
            _walletRepository = walletRepository;
            _itemRepository = itemRepository;
            _cartRepository = cartRepository;
            _transactionRepository = transactionRepository;
            _storeRepository = storeRepository;
            _reportLogRepository = reportLogRepository;
            _unitOfWork = unitOfWork;
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
            var createdTransactionIds = new List<int>();
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

            try
            {
                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    buyerWallet.Balance -= totalAmount;
                    buyerWallet.UpdatedAt = DateTime.UtcNow;
                    await _walletRepository.UpdateAsync(buyerWallet);

                    foreach (var sellerGroup in validatedItems.GroupBy(v => v.Store.OwnerId))
                    {
                        var sellerWallet = await _walletRepository.GetByUserIdAsync(sellerGroup.Key);
                        if (sellerWallet == null)
                        {
                            throw new CheckoutFailedException($"Seller wallet not found for store owner {sellerGroup.Key}.");
                        }

                        decimal sellerIncome = 0m;

                        foreach (var val in sellerGroup)
                        {
                            var cartItem = val.CartItem;
                            var item = val.Item;
                            var incomeAmount = item.Price * cartItem.Quantity;
                            sellerIncome += incomeAmount;

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
                                SellerId = sellerGroup.Key,
                                CategoryId = item.CategoryId,
                                ItemId = item.ItemId,
                                Amount = incomeAmount,
                                TransactionType = TransactionType.Purchase,
                                Status = TransactionStatus.Completed
                            };
                            await _transactionRepository.AddAsync(transaction);
                            createdTransactionIds.Add(transaction.TransactionId);
                        }

                        sellerWallet.Balance += sellerIncome;
                        sellerWallet.UpdatedAt = DateTime.UtcNow;
                        await _walletRepository.UpdateAsync(sellerWallet);
                    }

                    var reportLog = new ReportLog
                    {
                        GeneratedBy = userId,
                        ReportType = ReportType.Checkout,
                        Parameters = JsonSerializer.Serialize(new
                        {
                            UserId = userId,
                            CartId = cart.CartId,
                            Items = validatedItems.Select(v => new
                            {
                                v.Item.ItemId,
                                v.Item.Name,
                                v.CartItem.Quantity,
                                UnitPrice = v.Item.Price,
                                LineTotal = v.Item.Price * v.CartItem.Quantity,
                                v.Store.StoreId
                            })
                        }),
                        ResultSnapshot = JsonSerializer.Serialize(new
                        {
                            TotalAmount = totalAmount,
                            RemainingBalance = buyerWallet.Balance,
                            TransactionIds = createdTransactionIds,
                            Status = "completed"
                        }),
                        GeneratedAt = DateTime.UtcNow
                    };
                    await _reportLogRepository.AddAsync(reportLog);

                    cart.Items.Clear();
                    cart.Status = CartStatus.checked_out;
                    cart.UpdatedAt = DateTime.UtcNow;
                    await _cartRepository.UpdateAsync(cart);
                });
            }
            catch (CheckoutFailedException ex)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CHECKOUT_CART_FAILED",
                    new
                    {
                        Success = false,
                        Message = ex.Message
                    });
            }

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

        private sealed class CheckoutFailedException : Exception
        {
            public CheckoutFailedException(string message) : base(message) { }
        }
    }
}
