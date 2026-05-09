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
        //// Typical values: "Request" (Client -> Server), "Response" (Server -> Client), "Event" (Server push -> Client)
        public string MessageType { get; set; } = "Request";
        //Tells the Gateway exactly which user to route this to (used for Push Events)
        public string TargetId { get; set; } = string.Empty;
    }
}
