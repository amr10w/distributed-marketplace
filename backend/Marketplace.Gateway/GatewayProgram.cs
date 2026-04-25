using MarketPlace.Gateway.WebSockets;
using System.Net.WebSockets;

var builder = WebApplication.CreateBuilder(args);

// Force the Gateway to ALWAYS listen on port 5100
builder.WebHost.UseUrls("http://localhost:5100");

var app = builder.Build();

// Enable WebSockets
app.UseWebSockets(new WebSocketOptions
{
    KeepAliveInterval = TimeSpan.FromMinutes(2)
});

// The single endpoint for incoming WS connections
app.Map("/ws", async context =>
{
    if (context.WebSockets.IsWebSocketRequest)
    {
        using WebSocket webSocket = await context.WebSockets.AcceptWebSocketAsync();

        // Define where the internal Socket server is listening
        string backendHost = "127.0.0.1";
        int backendPort = 5000;

        var proxy = new WebSocketToSocketProxy(webSocket, backendHost, backendPort);
        await proxy.StartProxyingAsync(context.RequestAborted);
    }
    else
    {
        context.Response.StatusCode = StatusCodes.Status400BadRequest;
    }
});

app.Run();