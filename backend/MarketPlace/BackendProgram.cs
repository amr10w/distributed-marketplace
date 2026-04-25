using MarketPlace.Application.Commands;
using MarketPlace.Backend.TCPServer;
using MarketPlace.Backend.TCPServer.Routing;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure;
using MarketPlace.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
// using Marketplace.Infrastructure; // When you implement DI extension

// This is your Core Engine. It uses ASP.NET Core so we can host REST APIs and TCP Sockets side-by-side.
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<LoginCommandHandler>();
builder.Services.AddScoped<CreateAccountCommandHandler>();
builder.Services.AddScoped<CheckoutCartCommandHandler>();
builder.Services.AddScoped<DepositCashCommandHandler>();
builder.Services.AddScoped<AddItemCommandHandler>();
builder.Services.AddScoped<DeleteItemCommandHandler>();
builder.Services.AddScoped<EditItemCommandHandler>();
builder.Services.AddScoped<UpdateCartItemQuantityCommandHandler>();
builder.Services.AddScoped<AddToCartCommandHandler>();
builder.Services.AddScoped<CreateStoreCommandHandler>();
builder.Services.AddScoped<RemoveFromCartCommandHandler>();
// --- 1. Register Infrastructure and Application Services ---
// builder.Services.AddInfrastructure(); // Extension method to add DB/Repositories
builder.Services.AddSingleton<CommandDispatcher>();
builder.Services.AddTransient<LengthPrefixFramer>();

builder.Services.AddInfrastructure(builder.Configuration); // This one line registers all your repositories!

// --- 2. Register REST API Controllers ---
builder.Services.AddControllers();

// --- 3. Register the Raw TCP Listener as a Background Service ---
builder.Services.AddHostedService<ServerSocketService>();

var app = builder.Build();

// for migrations, run "dotnet ef migrations add InitialCreate -p Marketplace.Infrastructure -s MarketPlace.Backend" in the terminal
// the for loop is necessary because the database might not be available yet when the server starts, and we want to keep trying until it works.
// In production, you would want a more robust solution with proper logging and a maximum retry limit.

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var canConnect = await db.Database.CanConnectAsync();

    if (!canConnect)
    {
        throw new Exception(
            "Cannot connect to MariaDB Coordinator. " +
            "Check your ZeroTier connection and appsettings.json connection string.");
    }

    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
    logger.LogInformation("Successfully connected to MariaDB Coordinator via ZeroTier.");
}

// Map REST attribute routing
app.MapControllers();

// Start the server (Listens for HTTP on default ports, BackgroundService listens on custom TCP port)
app.Run();