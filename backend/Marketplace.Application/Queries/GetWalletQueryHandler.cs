using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Queries
{
    public class GetWalletQueryHandler
    {
        private readonly IWalletRepository _walletRepository;

        public GetWalletQueryHandler(IWalletRepository walletRepository)
        {
            _walletRepository = walletRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            var payload = JsonSerializer.Deserialize<GetWalletPayload>(request.Payload);
            if (payload is null || payload.UserId <= 0)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_WALLET_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Invalid user ID" })
                };
            }

            var wallet = await _walletRepository.GetByUserIdAsync(payload.UserId);
            if (wallet is null)
            {
                return new JsonEnvelope
                {
                    CorrelationId = request.CorrelationId,
                    Command = "GET_WALLET_FAILED",
                    Payload = JsonSerializer.Serialize(new { Message = "Wallet not found" })
                };
            }

            return new JsonEnvelope
            {
                CorrelationId = request.CorrelationId,
                Command = "GET_WALLET_SUCCESS",
                Payload = JsonSerializer.Serialize(new
                {
                    Balance = wallet.Balance,
                    Currency = wallet.Currency
                })
            };
        }
    }

    public record GetWalletPayload(int UserId);
}
