using MarketPlace.Application.Commands;
using MarketPlace.Application.DTOs;
using System.Text.Json;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection; 

namespace MarketPlace.Backend.TCPServer.Routing
{
    public class CommandDispatcher
    {
        private readonly IServiceProvider _serviceProvider;

        // Inject IServiceProvider instead of individual handlers
        public CommandDispatcher(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        /// <summary>
        /// Routes the incoming JSON envelope to the correct application handler.
        /// </summary>
        public async Task<JsonEnvelope> DispatchAsync(JsonEnvelope request)
        {
            if (request == null)
            {
                return BuildResponse(
                    string.Empty,
                    "INVALID_REQUEST",
                    new
                    {
                        Success = false,
                        Message = "Request is null."
                    });
            }

            // Create a scope for this specific command
            using (var scope = _serviceProvider.CreateScope())
            {
                // Resolve handlers within the scope
                var loginCommandHandler = scope.ServiceProvider.GetRequiredService<LoginCommandHandler>();
                var createAccountCommandHandler = scope.ServiceProvider.GetRequiredService<CreateAccountCommandHandler>();
                var checkoutCartCommandHandler = scope.ServiceProvider.GetRequiredService<CheckoutCartCommandHandler>();
                var depositCashCommandHandler = scope.ServiceProvider.GetRequiredService<DepositCashCommandHandler>();
                var addItemCommandHandler = scope.ServiceProvider.GetRequiredService<AddItemCommandHandler>();
                var editItemCommandHandler = scope.ServiceProvider.GetRequiredService<EditItemCommandHandler>();
                var deleteItemCommandHandler = scope.ServiceProvider.GetRequiredService<DeleteItemCommandHandler>();
                var addToCartCommandHandler = scope.ServiceProvider.GetRequiredService<AddToCartCommandHandler>();
                var removeFromCartCommandHandler = scope.ServiceProvider.GetRequiredService<RemoveFromCartCommandHandler>();
                var updateCartItemQuantityCommandHandler = scope.ServiceProvider.GetRequiredService<UpdateCartItemQuantityCommandHandler>();
                var createStoreCommandHandler = scope.ServiceProvider.GetRequiredService<CreateStoreCommandHandler>();

                switch (request.Command?.ToUpperInvariant())
                {
                    case "CHECKOUT_CART":
                        return await checkoutCartCommandHandler.HandleAsync(request);
                    case "LOGIN":
                        return await loginCommandHandler.HandleAsync(request);
                    case "CREATE_ACCOUNT":
                        return await createAccountCommandHandler.HandleAsync(request);
                    case "DEPOSIT_CASH":
                        return await depositCashCommandHandler.HandleAsync(request);
                    case "ADD_ITEM":
                        return await addItemCommandHandler.HandleAsync(request);
                    case "EDIT_ITEM":
                        return await editItemCommandHandler.HandleAsync(request);
                    case "DELETE_ITEM":
                        return await deleteItemCommandHandler.HandleAsync(request);
                    case "ADD_TO_CART":
                        return await addToCartCommandHandler.HandleAsync(request);
                    case "REMOVE_FROM_CART":
                        return await removeFromCartCommandHandler.HandleAsync(request);
                    case "UPDATE_CART_ITEM_QUANTITY":
                        return await updateCartItemQuantityCommandHandler.HandleAsync(request);
                    case "CREATE_STORE":
                        return await createStoreCommandHandler.HandleAsync(request);
                    default:
                        return BuildResponse(
                            request.CorrelationId,
                            "UNKNOWN_COMMAND",
                            new
                            {
                                Success = false,
                                Message = $"Command '{request.Command}' is not recognized."
                            });
                }
            }
        }

        private static JsonEnvelope BuildResponse(string correlationId, string command, object responsePayload)
        {
            return new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = command,
                Payload = JsonSerializer.Serialize(responsePayload)
            };
        }
    }
}