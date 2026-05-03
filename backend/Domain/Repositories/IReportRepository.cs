using MarketPlace.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MarketPlace.Domain.Repositories
{
    public interface IReportRepository
    {
        Task AddAsync(Report report);
        Task<IEnumerable<Report>> GetByUserIdAsync(int userId);
        Task<IEnumerable<Report>> GetByTypeAsync(ReportType reportType);
        Task<IEnumerable<Report>> GetAllForDashboardAsync(int pageSize = 50);
    }
}
