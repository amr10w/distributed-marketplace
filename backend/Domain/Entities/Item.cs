namespace MarketPlace.Domain.Entities
{
    public class Item
    {
        public int ItemId { get; set; }   
        public int StoreId { get; set; }   
        public int CategoryId { get; set; }   
        public string Name { get; set; } = string.Empty;
        public string? Brand { get; set; }   
        public string? Description { get; set; }
        public decimal Price { get; set; }
        public int StockQuantity { get; set; }   
        public string? ImageUrl { get; set; }   
        public ItemStatus Status { get; set; } = ItemStatus.available;  
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsAvailable => (Status == ItemStatus.available) && (StockQuantity > 0); 
    }
    public enum ItemStatus
    {
        available,
        sold,
        removed
    }
}
