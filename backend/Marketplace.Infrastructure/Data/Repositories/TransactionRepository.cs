using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class TransactionRepository : ITransactionRepository
    {
        private readonly AppDbContext _db;
        public TransactionRepository(AppDbContext db) { _db = db; }

        public async Task AddAsync(Transaction transaction)
        {
            if (transaction.CategoryId == 0)
                throw new InvalidOperationException(
                    "Transaction.CategoryId must be set. Copy it from the purchased Item — " +
                    "it is the shard key that routes this record to the correct storage node.");

            _db.Transactions.Add(transaction);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(Transaction transaction)
        {
            transaction.UpdatedAt = DateTime.UtcNow;
            _db.Transactions.Update(transaction);
            await _db.SaveChangesAsync();
        }

        public async Task<Transaction?> GetByIdAsync(int id)
            => await _db.Transactions
                        .AsNoTracking()
                        .FirstOrDefaultAsync(t => t.TransactionId == id);

        public async Task<IEnumerable<Transaction>> GetAllTransactionsForReportAsync()
            => await _db.Transactions
                        .AsNoTracking()
                        .OrderByDescending(t => t.CreatedAt)
                        .ToListAsync();

        public async Task<IEnumerable<Transaction>> GetByUserIdAsync(int userId)
            => await _db.Transactions
                        .AsNoTracking()
                        .Where(t => t.BuyerId == userId || t.SellerId == userId)
                        .OrderByDescending(t => t.CreatedAt)
                        .ToListAsync();
    }
}
