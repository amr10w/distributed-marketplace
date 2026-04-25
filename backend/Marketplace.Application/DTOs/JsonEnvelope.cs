namespace MarketPlace.Application.DTOs
{

    /// The standard wrapper for all messages passing through the TCP sockets.

    public class JsonEnvelope
    {
        // Used to match asynchronous server responses to the original React requests
        public string CorrelationId { get; set; } = string.Empty;

        // The routing directive (e.g., "PURCHASE_ITEM", "LOGIN")
        public string Command { get; set; } = string.Empty;

        // The actual data (e.g., {"ItemId": "123", "BidPrice": 50.00})
        public string Payload { get; set; } = string.Empty;
    }
}
