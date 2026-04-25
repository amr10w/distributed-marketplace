namespace MarketPlace.Domain.Entities
{

    public class Transaction
    {
        public int TransactionId { get; set; }
        public int BuyerId { get; set; }
        public int? SellerId { get; set; }
        public int? CategoryId { get; set; }
        public int? ItemId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType TransactionType { get; set; } = TransactionType.Purchase;
        public TransactionStatus Status { get; set; } = TransactionStatus.Completed;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }

    public enum TransactionType
    {
        Purchase,
        Refund,
        Deposit
    }

    public enum TransactionStatus
    {
        Pending,
        Completed,
        Failed,
        Refunded
    }
}
