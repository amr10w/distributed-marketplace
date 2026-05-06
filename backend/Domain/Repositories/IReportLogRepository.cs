using System.Collections.Generic;
using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface IReportLogRepository
    {
        Task AddAsync(ReportLog reportLog);
        Task<IEnumerable<ReportLog>> GetByUserIdAsync(int userId);
    }
}
