namespace MarketPlace.Domain.Entities
{

    public class Store
    {
        public int StoreId { get; set; }   
        public int OwnerId { get; set; }   
        public string StoreName { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? LogoUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
