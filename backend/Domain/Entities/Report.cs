using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketPlace.Domain.Entities
{
    public class Report
    {
        public int ReportId { get; set; }

        public ReportType ReportType { get; set; }

        // Who triggered this — a user action, a scheduled job, etc.
        public int GeneratedByUserId { get; set; }

        // Flexible FK — points to whatever entity caused the log entry.
        // e.g. a TransactionId for transaction_summary,
        //      an ItemId for inventory_status, etc.
        public int? RelatedEntityId { get; set; }

        // Human-readable label for RelatedEntityId: "Transaction", "Item", "User"
        public string? RelatedEntityType { get; set; }

        // Free-form JSON blob — store whatever snapshot data makes sense per type.
        // e.g. for revenue_by_category: {"CategoryId":3,"Revenue":450.00}
        public string? Metadata { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
    // needed to be consistentnt with the database schema, which uses snake_case for the ReportType values. (Edit the schema)
    // edited to not convert (but not conventional)
    public enum ReportType
    {
        transaction_summary,
        user_activity,
        inventory_status,
        revenue_by_category,
        top_sellers,
        custom
    }
}