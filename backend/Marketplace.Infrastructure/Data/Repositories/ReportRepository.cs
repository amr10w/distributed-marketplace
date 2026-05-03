using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _db;

        public ReportRepository(AppDbContext db) { _db = db; }

        public async Task AddAsync(Report report)
        {
            _db.Reports.Add(report);
            await _db.SaveChangesAsync();
        }

        public async Task<IEnumerable<Report>> GetByUserIdAsync(int userId)
            => await _db.Reports
                        .AsNoTracking()
                        .Where(r => r.GeneratedByUserId == userId)
                        .OrderByDescending(r => r.CreatedAt)
                        .ToListAsync();

        public async Task<IEnumerable<Report>> GetByTypeAsync(ReportType reportType)
            => await _db.Reports
                        .AsNoTracking()
                        .Where(r => r.ReportType == reportType)
                        .OrderByDescending(r => r.CreatedAt)
                        .ToListAsync();

        public async Task<IEnumerable<Report>> GetAllForDashboardAsync(int pageSize = 50)
            => await _db.Reports
                        .AsNoTracking()
                        .OrderByDescending(r => r.CreatedAt)
                        .Take(pageSize)
                        .ToListAsync();
    }
}