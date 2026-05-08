using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class ReportLogRepository : IReportLogRepository
    {
        private readonly AppDbContext _db;
        public ReportLogRepository(AppDbContext db) { _db = db; }

        public async Task AddAsync(ReportLog reportLog)
        {
            _db.ReportLogs.Add(reportLog);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<ReportLog>> GetByUserIdAsync(int userId)
            => await _db.ReportLogs
                        .AsNoTracking()
                        .Where(r => r.GeneratedBy == userId)
                        .OrderByDescending(r => r.GeneratedAt)
                        .ToListAsync();
    }
}
