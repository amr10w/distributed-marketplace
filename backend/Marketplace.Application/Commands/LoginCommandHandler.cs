using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Application.Commands
{
    public class LoginCommandHandler
    {
        private readonly IUserRepository _userRepository;

        public LoginCommandHandler(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            /*
             JSON request example:
             {
                  "CorrelationId": "req-001",
                  "Command": "LOGIN",
                  "Payload": "{\"Username\":\"ahmed\",\"Password\":\"123456\"}"
             }
             payload:
             {
                  "Username": "ahmed",
                  "Password": "123456"
             }
             */


            string username;
            string password;

            try
            {
                using var jsonDoc = JsonDocument.Parse(request.Payload);
                var root = jsonDoc.RootElement;

                username = root.GetProperty("Username").GetString() ?? string.Empty; // Expecting a property named "Username" in the JSON payload
                password = root.GetProperty("Password").GetString() ?? string.Empty; // Expecting a property named "Password" in the JSON payload
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "LOGIN_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload format."
                    });
            }

            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
            {
                return BuildResponse(
                    request.CorrelationId,
                    "LOGIN_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Username or password is empty."
                    });
            }

            var user = await _userRepository.GetByUsernameAsync(username);

            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "LOGIN_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }
            if (user.PasswordHash != password)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "LOGIN_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid username or password."
                    });
            }

            return BuildResponse(
                request.CorrelationId,
                "LOGIN_SUCCESS",
                new
                {
                    Success = true,
                    Message = "Login successful.",
                    UserId = user.UserId,
                    Username = user.Username
                });
        }

        private static JsonEnvelope BuildResponse(string correlationId, string command, object responsePayload)
        {
            return new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = command,
                Payload = JsonSerializer.Serialize(responsePayload) // Payload = "{\"Success\":true, \"Message\":\"Login successful.\", \"Username\":\"ahmed\"}"
            };
        }
    }
}