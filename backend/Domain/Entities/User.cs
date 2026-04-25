namespace MarketPlace.Domain.Entities
{
    /// <summary>
    /// 
    /// </summary>
    public class User
    {
        public int UserId { get; set; }   
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;   
        public string PasswordHash { get; set; } = string.Empty;
        public string? TwoFactorSecret { get; set; }
        public bool IsVerified { get; set; } = true; 
        public bool IsActive { get; set; } = true;  
        //public string? ProfileImageUrl { get; set; }   
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
