using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class CreateAccountCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IWalletRepository _walletRepository;

        public CreateAccountCommandHandler(IUserRepository userRepository, IWalletRepository walletRepository)
        {
            _userRepository = userRepository;
            _walletRepository = walletRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /* Example of incoming request:
                {
                  "CorrelationId": "req-002",
                  "Command": "CREATE_ACCOUNT",
                  "Payload": "{\"Username\":\"ahmed\",\"Password\":\"123456\"}"
                }
               Payload:
                {
                  "Username": "ahmed",
                  "Password": "123456"
                }
             */

            string username;
            string password;
            string email;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                username = root.GetProperty("Username").GetString() ?? string.Empty; // Expecting a property named "Username" in the JSON payload
                password = root.GetProperty("Password").GetString() ?? string.Empty; // Expecting a property named "Password" in the JSON payload
                email = root.GetProperty("Email").GetString() ?? string.Empty; // Expecting a property named "Password" in the JSON payload
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_ACCOUNT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload format."
                    });
            }

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(email))
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_ACCOUNT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Username or password is empty."
                    });
            }

            // Check if user exists
            var existingUser = await _userRepository.GetByUsernameAsync(username);

            if (existingUser != null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_ACCOUNT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Username already exists."
                    });
            }
            var existingEmailUser = await _userRepository.GetByEmailAsync(email);

            if (existingEmailUser != null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_ACCOUNT_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Email already exists."
                    });
            }

            var user = new User{Username = username, PasswordHash = password, Email = email};
            await _userRepository.AddAsync(user);

            var wallet = new Wallet{UserId = user.UserId, Balance = 0};
            await _walletRepository.AddAsync(wallet);

            return BuildResponse(
                request.CorrelationId,
                "CREATE_ACCOUNT_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Account created successfully.",
                    UserId = user.UserId
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


