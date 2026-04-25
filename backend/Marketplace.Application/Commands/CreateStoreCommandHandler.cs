using System.Text.Json;
using MarketPlace.Application.DTOs;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;

namespace MarketPlace.Application.Commands
{
    public class CreateStoreCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IStoreRepository _storeRepository;

        public CreateStoreCommandHandler(IUserRepository userRepository, IStoreRepository storeRepository)
        {
            _userRepository = userRepository;
            _storeRepository = storeRepository;
        }

        public async Task<JsonEnvelope> HandleAsync(JsonEnvelope request)
        {
            CreateStorePayload? payload;

            try
            {
                payload = JsonSerializer.Deserialize<CreateStorePayload>(request.Payload);
            }
            catch (JsonException)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_STORE_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload."
                    });
            }

            if (payload is null || payload.RequestingUserId == 0 || string.IsNullOrWhiteSpace(payload.StoreName))
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_STORE_FAILED",
                    new
                    {
                        Success = false,
                        Message = "Invalid payload."
                    });
            }

            var user = await _userRepository.GetByIdAsync(payload.RequestingUserId);
            if (user == null)
            {
                return BuildResponse(
                    request.CorrelationId,
                    "CREATE_STORE_FAILED",
                    new
                    {
                        Success = false,
                        Message = "User not found."
                    });
            }

            var store = new Store
            {
                OwnerId = payload.RequestingUserId,
                StoreName = payload.StoreName,
                Description = payload.Description,
                LogoUrl = payload.LogoUrl,
                IsActive = true
            };

            await _storeRepository.AddAsync(store);

            return BuildResponse(
                request.CorrelationId,
                "CREATE_STORE_SUCCESS",
                new
                {
                    Success = true,
                    StoreId = store.StoreId,
                    StoreName = store.StoreName
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

    public record CreateStorePayload(
        int RequestingUserId,
        string StoreName,
        string? Description,
        string? LogoUrl
    );
}