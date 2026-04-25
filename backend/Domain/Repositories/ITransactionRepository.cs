using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    /// <summary>
    /// Added to support Feature ix: Generating Reports.
    /// </summary>
    public interface ITransactionRepository
    {
        Task AddAsync(Transaction transaction);
        Task UpdateAsync(Transaction transaction); // E.g., updating Status from Pending to Completed

        /// <summary>
        /// Fetches all transactions to generate the required system report.
        /// </summary>
        Task<IEnumerable<Transaction>> GetAllTransactionsForReportAsync();
    }
}