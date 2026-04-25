using System;
using System.Net;
using System.Net.Sockets;
using System.Threading;
using System.Threading.Tasks;
using MarketPlace.Backend.TCPServer.Routing;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace MarketPlace.Backend.TCPServer
{
    public class ServerSocketService : BackgroundService
    {
        private readonly ILogger<ServerSocketService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly LengthPrefixFramer _framer;
        private Socket? _listenerSocket;
        private readonly int _port = 5000;

        // Inject the dependencies registered in BackendProgram.cs
        public ServerSocketService(ILogger<ServerSocketService> logger, IServiceScopeFactory scopeFactory, LengthPrefixFramer framer)
        {
            _logger = logger;
            _scopeFactory = scopeFactory;
            _framer = framer;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _listenerSocket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
            _listenerSocket.Bind(new IPEndPoint(IPAddress.Any, _port));
            _listenerSocket.Listen(100);

            _logger.LogInformation($"Server Socket listening on port {_port}");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var clientSocket = await _listenerSocket.AcceptAsync(stoppingToken);
                    _logger.LogInformation($"Client connected: {clientSocket.RemoteEndPoint}");

                    _ = Task.Run(() => ProcessConnectionAsync(clientSocket, stoppingToken), stoppingToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError($"Error accepting connection: {ex.Message}");
                }
            }
        }

        private async Task ProcessConnectionAsync(Socket socket, CancellationToken cancellationToken)
        {
            // 1 & 2: Instantiate ConnectionProcessor and pass the injected dependencies
            var processor = new ConnectionProcessor(socket, _framer, _scopeFactory );

            // Start the pipeline loops
            await processor.StartAsync();

            _logger.LogInformation($"Client disconnected: {socket.RemoteEndPoint}");
        }
    }
}