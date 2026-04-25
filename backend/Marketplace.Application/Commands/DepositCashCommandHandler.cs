using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Commands
{
    public class DepositCashCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IWalletRepository _walletRepository;
        private readonly ITransactionRepository _transactionRepository;

        public DepositCashCommandHandler(IUserRepository userRepository, IWalletRepository walletRepository, ITransactionRepository transactionRepository)
        {
            _userRepository = userRepository;
            _walletRepository = walletRepository;
            _transactionRepository = transactionRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /* Example of incoming request:
                {
                  "CorrelationId": "req-003",
                  "Command": "DEPOSIT_CASH",
                  "Payload": "{\"UserId\":\"1\",\"Amount\":100.0}"
                }
               Payload:
                {
                  "UserId": "1",
                  "Amount": 100.0
                }
             */

            int userid;
            decimal amount;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                userid = root.GetProperty("UserId").GetInt32();
                amount = root.GetProperty("Amount").GetDecimal();
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "DEPOSIT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload format."
                    });
            }

            if (amount <= 0)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "DEPOSIT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Deposit amount must be greater than zero."
                    });
            }

            var user = await _userRepository.GetByIdAsync(userid);

            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "DEPOSIT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var wallet = await _walletRepository.DepositAsync(user.UserId, amount);

            if (wallet == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "DEPOSIT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Wallet not found for user."
                    });
            }

            var transaction = new Transaction
            {
                BuyerId = user.UserId,
                Amount = amount,
                TransactionType = TransactionType.Deposit,
                Status = TransactionStatus.Completed
            };

            await _transactionRepository.AddAsync(transaction);

            return BuildResponse(
                request.CorrelationId,
                "DEPOSIT_SUCCESS",
                new
                {
                    Success = true,
                    NewBalance = wallet.Balance
                });

        }

        private static JsonEnvelope BuildResponse(string correlationId, string command, object payload)
        {
            return new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = command,
                Payload = System.Text.Json.JsonSerializer.Serialize(payload)
            };
        }
    }
}