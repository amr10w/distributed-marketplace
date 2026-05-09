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
        public async Task<JsonEnvelope> DispatchAsync(JsonEnvelope request, ConnectionProcessor currentConnection)
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
                switch (request.Command?.ToUpperInvariant())
                {
                    case "REGISTER_SOCKET":
                        var connectionManager = scope.ServiceProvider.GetRequiredService<TcpConnectionManager>();
                        return HandleRegisterSocket(request, currentConnection, connectionManager);

                    case "SEND_CHAT":
                        var sendHandler = scope.ServiceProvider.GetRequiredService<SendMessageCommandHandler>();
                        var connManager = scope.ServiceProvider.GetRequiredService<TcpConnectionManager>();
                        return await HandleSendChatAsync(request, sendHandler, connManager, currentConnection);
                    case "GET_CHAT_HISTORY":
                        var historyHandler = scope.ServiceProvider.GetRequiredService<GetChatHistoryQueryHandler>();
                        return await HandleGetChatHistoryAsync(request, historyHandler);

                    case "CHECKOUT_CART":
                        return await scope.ServiceProvider.GetRequiredService<CheckoutCartCommandHandler>().HandleAsync(request);
                    case "ADD_ITEM":
                        return await scope.ServiceProvider.GetRequiredService<AddItemCommandHandler>().HandleAsync(request);
                    case "EDIT_ITEM":
                        return await scope.ServiceProvider.GetRequiredService<EditItemCommandHandler>().HandleAsync(request);
                    case "DELETE_ITEM":
                        return await scope.ServiceProvider.GetRequiredService<DeleteItemCommandHandler>().HandleAsync(request);
                    case "ADD_TO_CART":
                        return await scope.ServiceProvider.GetRequiredService<AddToCartCommandHandler>().HandleAsync(request);
                    case "REMOVE_FROM_CART":
                        return await scope.ServiceProvider.GetRequiredService<RemoveFromCartCommandHandler>().HandleAsync(request);
                    case "UPDATE_CART_ITEM_QUANTITY":
                        return await scope.ServiceProvider.GetRequiredService<UpdateCartItemQuantityCommandHandler>().HandleAsync(request);
                    case "CREATE_STORE":
                        return await scope.ServiceProvider.GetRequiredService<CreateStoreCommandHandler>().HandleAsync(request);
                    case "GET_USER_CART":
                        return await scope.ServiceProvider.GetRequiredService<GetUserCartQueryHandler>().HandleAsync(request);
                    case "GET_USER_INVENTORY":
                        return await scope.ServiceProvider.GetRequiredService<GetUserInventoryQueryHandler>().HandleAsync(request);
                    case "SEARCH_ITEMS":
                        return await scope.ServiceProvider.GetRequiredService<SearchItemsQueryHandler>().HandleAsync(request);
                    case "GET_ALL_ITEMS":
                        return await scope.ServiceProvider.GetRequiredService<GetAllItemsQueryHandler>().HandleAsync(request);
                    case "GET_ITEM_BY_ID":
                        return await scope.ServiceProvider.GetRequiredService<GetItemByIdQueryHandler>().HandleAsync(request);
                    case "GET_WALLET":
                        return await scope.ServiceProvider.GetRequiredService<GetWalletQueryHandler>().HandleAsync(request);
                    case "GET_USER_TRANSACTIONS":
                        return await scope.ServiceProvider.GetRequiredService<GetUserTransactionsQueryHandler>().HandleAsync(request);
                    case "GET_USER_REPORTS":
                        return await scope.ServiceProvider.GetRequiredService<GetUserReportsQueryHandler>().HandleAsync(request);
                    default:
                        return BuildResponse(request.CorrelationId, "UNKNOWN_COMMAND", new { Success = false, Message = "Command not recognized." });
                }
            }
        }
        private JsonEnvelope HandleRegisterSocket(JsonEnvelope request, ConnectionProcessor currentConnection, TcpConnectionManager connectionManager)
        {
            var command = JsonSerializer.Deserialize<RegisterSocketCommand>(request.Payload);

            // Link the socket to the user ID provided by the frontend
            currentConnection.LoggedInUserId = command.UserId;
            connectionManager.RegisterUser(command.UserId, currentConnection);

            return BuildResponse(request.CorrelationId, request.Command, new { Success = true, Message = "Socket linked to user." });
        }

        private async Task<JsonEnvelope> HandleSendChatAsync(JsonEnvelope request, SendMessageCommandHandler handler, TcpConnectionManager connectionManager, ConnectionProcessor currentConnection)
        {
            if (!currentConnection.LoggedInUserId.HasValue)
            {
                return BuildResponse(request.CorrelationId, request.Command, new { Success = false, Message = "Socket not authenticated. Please register socket first." });
            }
            var command = JsonSerializer.Deserialize<SendMessageCommand>(request.Payload);
            command.SenderId = currentConnection.LoggedInUserId.Value;
            var message = await handler.HandleAsync(command);
            var pushEvent = new JsonEnvelope
            {
                MessageType = "Event",
                Command = "RECEIVE_CHAT",
                TargetId = message.ReceiverId.ToString(),
                Payload = JsonSerializer.Serialize(message)
            };
            await connectionManager.TrySendMessageToUserAsync(message.ReceiverId, pushEvent);
            return BuildResponse(request.CorrelationId, request.Command, new { Success = true, MessageId = message.Id });
        }

        private async Task<JsonEnvelope> HandleGetChatHistoryAsync(JsonEnvelope request, GetChatHistoryQueryHandler handler)
        {
            var query = JsonSerializer.Deserialize<GetChatHistoryQuery>(request.Payload);
            var history = await handler.HandleAsync(query);

            return BuildResponse(request.CorrelationId, request.Command, history);
        }
        private static JsonEnvelope BuildResponse(string correlationId, string command, object responsePayload, string messageType = "Response")
        {
            return new JsonEnvelope
            {
                CorrelationId = correlationId,
                Command = command,
                MessageType = messageType,
                Payload = JsonSerializer.Serialize(responsePayload)
            };
        }
    }
}