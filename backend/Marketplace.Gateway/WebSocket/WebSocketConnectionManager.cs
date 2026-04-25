using MarketPlace.Gateway.ClientServer;
using System.Net.WebSockets;
using System.Text;

namespace MarketPlace.Gateway.WebSockets;

public class WebSocketToSocketProxy
{
    private readonly WebSocket _webSocket;
    private readonly string _sockectHost;
    private readonly int _sockectPort;

    public WebSocketToSocketProxy(WebSocket webSocket, string sockectHost, int sockectPort)
    {
        _webSocket = webSocket;
        _sockectHost = sockectHost;
        _sockectPort = sockectPort;
    }

    public async Task StartProxyingAsync(CancellationToken cancellationToken)
    {
        using var SocketWrapper = new ClientServerWrapper();
        await SocketWrapper.ConnectAsync(_sockectHost, _sockectPort);

        // Run both read loops concurrently
        var wsToSocketTask = PumpWebSocketToSocketAsync(SocketWrapper, cancellationToken);
        var SocketToWsTask = PumpSocketToWebSocketAsync(SocketWrapper, cancellationToken);

        // If either side disconnects, the task completes and tears down the proxy
        await Task.WhenAny(wsToSocketTask, SocketToWsTask);
    }

    private async Task PumpWebSocketToSocketAsync(ClientServerWrapper SocketWrapper, CancellationToken cancellationToken)
    {
        var buffer = new byte[1024 * 4];

        try
        {
            while (_webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);

                if (result.MessageType == WebSocketMessageType.Close)
                {
                    await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Client closing", cancellationToken);
                    break;
                }

                // Assuming text/JSON communication
                if (result.MessageType == WebSocketMessageType.Text)
                {
                    string jsonPayload = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    await SocketWrapper.SendMessageAsync(jsonPayload, cancellationToken);
                }
            }
        }
        catch (OperationCanceledException) { /* Normal termination */ }
        catch (Exception ex)
        {
            Console.WriteLine($"WS -> Socket Error: {ex.Message}");
        }
    }

    private async Task PumpSocketToWebSocketAsync(ClientServerWrapper SocketWrapper, CancellationToken cancellationToken)
    {
        try
        {
            while (_webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
            {
                string? jsonResponse = await SocketWrapper.ReceiveMessageAsync(cancellationToken);

                if (jsonResponse == null) break; // Backend closed connection

                byte[] responseBytes = Encoding.UTF8.GetBytes(jsonResponse);

                await _webSocket.SendAsync(
                    new ArraySegment<byte>(responseBytes),
                    WebSocketMessageType.Text,
                    true,
                    cancellationToken);
            }
        }
        catch (OperationCanceledException) { /* Normal termination */ }
        catch (Exception ex)
        {
            Console.WriteLine($"Socket -> WS Error: {ex.Message}");
        }
    }
}