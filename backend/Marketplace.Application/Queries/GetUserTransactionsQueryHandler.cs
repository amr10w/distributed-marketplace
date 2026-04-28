using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetUserTransactionsQueryHandler
    {
        private readonly ITransactionRepository _transactionRepository;
        private readonly IItemRepository _itemRepository;
        private readonly IUserRepository _userRepository;

        public GetUserTransactionsQueryHandler(
            ITransactionRepository transactionRepository,
            IItemRepository itemRepository,
            IUserRepository userRepository)
        {
            _transactionRepository = transactionRepository;
            _itemRepository = itemRepository;
            _userRepository = userRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            var payload = JsonSerializer.Deserialize<GetUserTransactionsPayload>(request.Payload);
            if (payload is null || payload.UserId <= 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_USER_TRANSACTIONS_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid user ID" })
                };
            }

            var transactions = await _transactionRepository.GetByUserIdAsync(payload.UserId);
            var enriched = new List<object>();

            foreach (var t in transactions)
            {
                string itemName = "";
                if (t.ItemId.HasValue)
                {
                    var item = await _itemRepository.GetByIdAsync(t.ItemId.Value);
                    itemName = item?.Name ?? "";
                }

                string buyerName = "";
                var buyer = await _userRepository.GetByIdAsync(t.BuyerId);
                buyerName = buyer?.Username ?? "";

                string sellerName = "";
                if (t.SellerId.HasValue)
                {
                    var seller = await _userRepository.GetByIdAsync(t.SellerId.Value);
                    sellerName = seller?.Username ?? "";
                }

                enriched.Add(new
                {
                    t.TransactionId,
                    t.BuyerId,
                    BuyerName = buyerName,
                    SellerId = t.SellerId,
                    SellerName = sellerName,
                    ItemId = t.ItemId,
                    ItemName = itemName,
                    t.Amount,
                    TransactionType = t.TransactionType.ToString(),
                    Status = t.Status.ToString(),
                    t.CreatedAt,
                });
            }

            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_USER_TRANSACTIONS_SUCCESS",
                Payload = JsonSerializer.Serialize(new { Transactions = enriched })
            };
        }
    }

    public record GetUserTransactionsPayload(int UserId);
}
