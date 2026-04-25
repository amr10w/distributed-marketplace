using System;
using System.Buffers;

namespace MarketPlace.Backend.TCPServer
{
    public class LengthPrefixFramer
    {
        /// <summary>
        /// Inspects the incoming byte stream to extract a complete message based on the 4-byte header.
        /// </summary>
        /// <param name="buffer">The current unread bytes in the pipeline.</param>
        /// <param name="payload">The extracted payload (if a full message is available).</param>
        /// <returns>True if a full message was parsed, False if we need to wait for more data.</returns>
        public bool TryParseFrame(ref ReadOnlySequence<byte> buffer, out byte[] payload)
        {
            payload = Array.Empty<byte>();

            // 1. Check if we have at least the 4-byte header
            if (buffer.Length < 4) return false;

            // 2. Extract the 4 bytes into a stack-allocated span (Zero garbage collection/memory leaks)
            Span<byte> lengthBytes = stackalloc byte[4];
            buffer.Slice(0, 4).CopyTo(lengthBytes);

            // Convert Big-Endian to architecture native
            if (BitConverter.IsLittleEndian)
            {
                lengthBytes.Reverse();
            }

            int payloadLength = BitConverter.ToInt32(lengthBytes);

            // 3. Check if we have the full message (Header + Payload)
            if (buffer.Length < 4 + payloadLength) return false;

            // 4. We have the full message! Extract the payload bytes.
            payload = buffer.Slice(4, payloadLength).ToArray();

            // 5. Update the 'buffer' reference to point past the consumed message (Advance the pipeline)
            buffer = buffer.Slice(4 + payloadLength);

            // 6. Return true indicating a full frame was extracted
            return true;
        }
    }
}