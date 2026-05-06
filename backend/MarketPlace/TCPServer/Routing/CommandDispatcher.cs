using MarketPlace.Application.Commands;
using MarketPlace.Application.DTOs;
using System.Text.Json;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using MarketPlace.Application.Queries;

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

                //Resolve Queries within the scope
                var getUserCartQueryHandler = scope.ServiceProvider.GetRequiredService<GetUserCartQueryHandler>();
                var getUsertInventoryQueryHandler = scope.ServiceProvider.GetRequiredService<GetUserInventoryQueryHandler>();
                var searchItemsQueryHandler = scope.ServiceProvider.GetRequiredService<SearchItemsQueryHandler>();
                var getAllItemsQueryHandler = scope.ServiceProvider.GetRequiredService<GetAllItemsQueryHandler>();
                var getItemByIdQueryHandler = scope.ServiceProvider.GetRequiredService<GetItemByIdQueryHandler>();
                var getWalletQueryHandler = scope.ServiceProvider.GetRequiredService<GetWalletQueryHandler>();
                var getUserTransactionsQueryHandler = scope.ServiceProvider.GetRequiredService<GetUserTransactionsQueryHandler>();
                var getUserReportsQueryHandler = scope.ServiceProvider.GetRequiredService<GetUserReportsQueryHandler>();


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
                    case "GET_USER_CART":
                        return await getUserCartQueryHandler.HandleAsync(request);
                    case "GET_USER_INVENTORY":
                        return await getUsertInventoryQueryHandler.HandleAsync(request);
                    case "SEARCH_ITEMS":
                        return await searchItemsQueryHandler.HandleAsync(request);
                    case "GET_ALL_ITEMS":
                        return await getAllItemsQueryHandler.HandleAsync(request);
                    case "GET_ITEM_BY_ID":
                        return await getItemByIdQueryHandler.HandleAsync(request);
                    case "GET_WALLET":
                        return await getWalletQueryHandler.HandleAsync(request);
                    case "GET_USER_TRANSACTIONS":
                        return await getUserTransactionsQueryHandler.HandleAsync(request);
                    case "GET_USER_REPORTS":
                        return await getUserReportsQueryHandler.HandleAsync(request);
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