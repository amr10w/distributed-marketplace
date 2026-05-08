using MarketPlace.Application.Commands;
using MarketPlace.Backend.TCPServer;
using MarketPlace.Backend.TCPServer.Routing;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure;
using MarketPlace.Infrastructure.Data;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
<<<<<<< Updated upstream
// using Marketplace.Infrastructure; // When you implement DI extension
=======
using Microsoft.Extensions.Logging;
using System.Text.Json; // Added for camelCase JSON options
using MarketPlace.Application.Queries;
using System;
>>>>>>> Stashed changes

// This is your Core Engine. It uses ASP.NET Core so we can host REST APIs and TCP Sockets side-by-side.
var builder = WebApplication.CreateBuilder(args);

// ---> FRONTEND REQUIREMENT 6: Force HTTP REST API to run on Port 8080
builder.WebHost.UseUrls("http://localhost:8080");

// --- Register Application Handlers ---
builder.Services.AddScoped<CheckoutCartCommandHandler>();
builder.Services.AddScoped<AddItemCommandHandler>();
builder.Services.AddScoped<DeleteItemCommandHandler>();
builder.Services.AddScoped<EditItemCommandHandler>();
builder.Services.AddScoped<UpdateCartItemQuantityCommandHandler>();
builder.Services.AddScoped<AddToCartCommandHandler>();
builder.Services.AddScoped<CreateStoreCommandHandler>();
builder.Services.AddScoped<RemoveFromCartCommandHandler>();
// --- 1. Register Infrastructure and Application Services ---
builder.Services.AddSingleton<CommandDispatcher>();
builder.Services.AddTransient<LengthPrefixFramer>();

builder.Services.AddInfrastructure(builder.Configuration); // This one line registers all your repositories!

// ---> FRONTEND REQUIREMENT 5: Setup CORS for the Vite Frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("FrontendPolicy", policy =>
    {
        policy.WithOrigins("http://localhost:3000") // Your React app's port
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ---> FRONTEND REQUIREMENT 2: Force all JSON responses to automatically use camelCase
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
    });

// --- 3. Register the Raw TCP Listener as a Background Service ---
builder.Services.AddHostedService<ServerSocketService>();

var app = builder.Build();

// Database Connection Check
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

// ---> FRONTEND REQUIREMENT 5: Apply the CORS policy BEFORE mapping controllers
app.UseCors("FrontendPolicy");

// Map REST attribute routing
app.MapControllers();

// Start the server (Listens for HTTP on default ports, BackgroundService listens on custom TCP port)
app.Run();