using MarketPlace.Application.DTOs; 
using MarketPlace.Backend.TCPServer.Routing;
using System;
using System.IO.Pipelines;
using System.Net.Sockets;
using System.Text;
using System.Text.Json;
using System.Buffers;
using System.Threading.Tasks;

namespace MarketPlace.Backend.TCPServer
{
    public class ConnectionProcessor
    {
        private readonly Socket _socket;
        private readonly LengthPrefixFramer _framer;
        private readonly IServiceScopeFactory _scopeFactory;

        // Uncommented and updated constructor
        public ConnectionProcessor(Socket socket, LengthPrefixFramer framer, IServiceScopeFactory scopeFactory)
        {
            _socket = socket;
            _framer = framer;
            _scopeFactory = scopeFactory;
        }

        public async Task StartAsync()
        {
            var pipe = new Pipe();

            var fillPipeTask = FillPipeAsync(_socket, pipe.Writer);
            var readPipeTask = ReadPipeAsync(pipe.Reader);

            await Task.WhenAll(fillPipeTask, readPipeTask);
        }

        private async Task FillPipeAsync(Socket socket, PipeWriter writer)
        {
            const int minimumBufferSize = 512;

            try
            {
                while (true)
                {
                    // 1. Request memory from the writer
                    Memory<byte> memory = writer.GetMemory(minimumBufferSize);

                    // 2. Receive raw bytes from the socket
                    int bytesRead = await socket.ReceiveAsync(memory, SocketFlags.None);
                    if (bytesRead == 0)
                    {
                        break; // Socket gracefully closed
                    }

                    // 3. Tell the writer how many bytes were written
                    writer.Advance(bytesRead);

                    // 4. Notify the reader that data is available
                    FlushResult result = await writer.FlushAsync();

                    if (result.IsCompleted)
                    {
                        break;
                    }
                }
            }
            catch (SocketException)
            {
                // Client disconnected unexpectedly
            }
            finally
            {
                await writer.CompleteAsync();
            }
        }

        private async Task ReadPipeAsync(PipeReader reader)
        {
            try
            {
                while (true)
                {
                    // 1. Await data from the writer
                    ReadResult result = await reader.ReadAsync();
                    ReadOnlySequence<byte> buffer = result.Buffer;

                    // 2. Pass buffer to framer. Use a while loop in case multiple messages arrived at once!
                    while (_framer.TryParseFrame(ref buffer, out byte[] payloadBytes))
                    {
                        // 3. We have a full JSON payload. Parse and Dispatch it.
                        string jsonString = Encoding.UTF8.GetString(payloadBytes);

                        try
                        {
                            var envelope = JsonSerializer.Deserialize<JsonEnvelope>(jsonString);
                            if (envelope != null)
                            {
                                // Wrap the dispatch and response in a Task so we don't block the reader loop
                                _ = Task.Run(async () =>
                                {
                                    // MOVE THE TRY HERE: Now it catches errors happening in this specific background task!
                                    try
                                    {
                                        // 1. Get the response from your application logic
                                        using var scope = _scopeFactory.CreateScope();
                                        {   
                                            var dispatcher = scope.ServiceProvider.GetRequiredService<CommandDispatcher>();
                                            JsonEnvelope responseEnvelope = await dispatcher.DispatchAsync(envelope);
                                            if (responseEnvelope != null)
                                            {
                                                // 2. Serialize the response back to JSON
                                                string responseJson = JsonSerializer.Serialize(responseEnvelope);
                                                byte[] responsePayload = Encoding.UTF8.GetBytes(responseJson);

                                                // 3. Create the 4-byte Big-Endian Header
                                                byte[] lengthHeader = BitConverter.GetBytes(responsePayload.Length);
                                                if (BitConverter.IsLittleEndian)
                                                {
                                                    Array.Reverse(lengthHeader);
                                                }

                                                // 4. Combine Header + Payload into one packet
                                                byte[] fullPacket = new byte[4 + responsePayload.Length];
                                                Buffer.BlockCopy(lengthHeader, 0, fullPacket, 0, 4);
                                                Buffer.BlockCopy(responsePayload, 0, fullPacket, 4, responsePayload.Length);

                                                // 5. Send it back through the raw socket!
                                                await _socket.SendAsync(fullPacket, SocketFlags.None);
                                            }
                                        }

                                    }
                                    catch (Exception ex)
                                    {
                                        // NOW this will actually print if a handler fails!
                                        Console.WriteLine($"[HANDLER CRASH] {ex.Message}");
                                    }
                                });
                            }
                        }
                        catch (JsonException)
                        {
                            Console.WriteLine("Received invalid JSON envelope.");
                        }
                    }
                    //var envelope = JsonSerializer.Deserialize<JsonEnvelope>(jsonString);
                    //if (envelope != null)
                    //{
                    //    // Fire and forget the dispatcher so we don't block the socket read loop
                    //    _ = _dispatcher.DispatchAsync(envelope);
                    //}


                    // 4. Tell the pipeline how much memory was consumed
                    reader.AdvanceTo(buffer.Start, buffer.End);

                    // 5. Break if the stream is done
                    if (result.IsCompleted)
                    {
                        break;
                    }
                }
            }
            finally
            {
                await reader.CompleteAsync();
                _socket.Close();
            }
        }
    }
}