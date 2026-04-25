using System;
using System.IO;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace MarketPlace.Gateway.ClientServer;

public class ClientServerWrapper : IDisposable
{
    private readonly Socket _socket;

    public ClientServerWrapper()
    {
        // Define the exact low-level protocols
        _socket = new Socket(AddressFamily.InterNetwork, SocketType.Stream, ProtocolType.Tcp);
    }

    // Connects asynchronously to avoid blocking the Gateway
    public async Task ConnectAsync(string host, int port)
    {
        await _socket.ConnectAsync(host, port);
    }

    public async Task SendMessageAsync(string jsonMessage, CancellationToken cancellationToken)
    {
        byte[] payloadBytes = Encoding.UTF8.GetBytes(jsonMessage);
        byte[] lengthPrefix = BitConverter.GetBytes(payloadBytes.Length);

        // Ensure Big-Endian network byte order
        if (BitConverter.IsLittleEndian)
        {
            Array.Reverse(lengthPrefix);
        }

        // Combine Header + Payload into one buffer for a single, atomic network push
        byte[] fullPacket = new byte[4 + payloadBytes.Length];
        Buffer.BlockCopy(lengthPrefix, 0, fullPacket, 0, 4);
        Buffer.BlockCopy(payloadBytes, 0, fullPacket, 4, payloadBytes.Length);

        // Send directly over the raw socket
        await _socket.SendAsync(new ArraySegment<byte>(fullPacket), SocketFlags.None, cancellationToken);
    }

    public async Task<string?> ReceiveMessageAsync(CancellationToken cancellationToken)
    {
        byte[] lengthBuffer = new byte[4];
        int headerBytesRead = await ReadExactlyAsync(_socket, lengthBuffer, 4, cancellationToken);

        if (headerBytesRead == 0) return null; // Connection closed cleanly

        if (BitConverter.IsLittleEndian)
        {
            Array.Reverse(lengthBuffer);
        }

        int payloadLength = BitConverter.ToInt32(lengthBuffer, 0);
        byte[] payloadBuffer = new byte[payloadLength];

        int payloadBytesRead = await ReadExactlyAsync(_socket, payloadBuffer, payloadLength, cancellationToken);

        if (payloadBytesRead < payloadLength)
        {
            throw new EndOfStreamException("Socket connection dropped before full payload was received.");
        }

        return Encoding.UTF8.GetString(payloadBuffer);
    }

    // Low-level helper to prevent Partial Socket Reads
    private async Task<int> ReadExactlyAsync(Socket socket, byte[] buffer, int count, CancellationToken cancellationToken)
    {
        int totalRead = 0;
        while (totalRead < count)
        {
            // Calculate how much space is left to read, and receive directly into that memory slice
            int read = await socket.ReceiveAsync(new ArraySegment<byte>(buffer, totalRead, count - totalRead), SocketFlags.None, cancellationToken);
            if (read == 0) break;
            totalRead += read;
        }
        return totalRead;
    }

    public void Dispose()
    {
        _socket?.Dispose();
    }
}