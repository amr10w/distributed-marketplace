namespace MarketPlace.Domain.Entities
{
    public class Cart
    {
        public int CartId { get; set; }
        public int UserId { get; set; }
        public CartStatus Status { get; set; } = CartStatus.active;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public List<CartItem> Items { get; set; } = new();
    }

    public enum CartStatus
    {
        active,
        checked_out,
        abandoned
    }
}