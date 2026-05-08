namespace MarketPlace.Domain.Entities
{
    public class ReportLog
    {
        public int ReportId { get; set; }
        public int GeneratedBy { get; set; }
        public ReportType ReportType { get; set; }
        public string? Parameters { get; set; }
        public string? ResultSnapshot { get; set; }
        public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
    }

    public enum ReportType
    {
        Checkout,
        DepositCash
    }
}
