namespace MarketPlace.Domain.Entities
{
    /// <summary>
    /// 
    /// </summary>
    public class Wallet
    {
        public int WalletId { get; set; }   
        public int UserId { get; set; }  
        public decimal Balance { get; set; }  
        public string Currency { get; set; } = "USD";  
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
