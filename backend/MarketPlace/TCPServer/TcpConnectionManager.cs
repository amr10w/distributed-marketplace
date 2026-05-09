using MarketPlace.Application.DTOs;
using System.Collections.Concurrent;
using System.Threading.Tasks;

namespace MarketPlace.Backend.TCPServer
{
    public class TcpConnectionManager
    {
        private readonly ConcurrentDictionary<int, ConnectionProcessor> _activeUsers = new();

        public void RegisterUser(int userId, ConnectionProcessor connection)
        {
            _activeUsers.AddOrUpdate(userId, connection, (_, _) => connection);
        }

        public void RemoveUser(int userId, ConnectionProcessor connectionToRemove)
        {
            if (_activeUsers.TryGetValue(userId, out var currentConnection))
            {
                if (ReferenceEquals(currentConnection, connectionToRemove))
                {
                    _activeUsers.TryRemove(userId, out _);
                }
            }
        }

        public bool IsUserOnline(int userId)
        {
            return _activeUsers.ContainsKey(userId);
        }

        public async Task<bool> TrySendMessageToUserAsync(int userId, JsonEnvelope envelope)
        {
            if (_activeUsers.TryGetValue(userId, out var processor))
            {
                await processor.SendEnvelopeAsync(envelope);
                return true;
            }

            return false; 
        }
    }
}
