using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class WalletRepository : IWalletRepository
    {
        private const int MaxRetries = 5;
        private readonly AppDbContext _db;
        public WalletRepository(AppDbContext db) { _db = db; }

        // Tracked read — EF holds updated_at so UpdateAsync can detect conflicts
        public async Task<Wallet?> GetByUserIdAsync(int userId)
            => await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);

        public async Task AddAsync(Wallet wallet)
        {
            _db.Wallets.Add(wallet);
            await _db.SaveChangesAsync();
        }

        /// <summary>
        /// Retries on optimistic concurrency conflict.
        /// Two simultaneous purchases/deposits hitting the same wallet will race —
        /// the loser gets a fresh balance re-read and retries up to MaxRetries times.
        /// </summary>
        public async Task UpdateAsync(Wallet wallet)
        {
            int attempt = 0;
            while (true)
            {
                attempt++;
                try
                {
                    wallet.UpdatedAt = DateTime.UtcNow;
                    _db.Wallets.Update(wallet);
                    await _db.SaveChangesAsync();
                    return;
                }
                catch (DbUpdateConcurrencyException ex) when (attempt < MaxRetries)
                {
                    var entry = ex.Entries[0];
                    await entry.ReloadAsync();
                    wallet.Balance = (decimal)entry.CurrentValues[nameof(Wallet.Balance)]!;
                    wallet.UpdatedAt = (DateTime)entry.CurrentValues[nameof(Wallet.UpdatedAt)]!;
                    _db.ChangeTracker.Clear();   // reset tracker so next attempt is clean
                }
            }
        }

        public async Task<Wallet?> DepositAsync(int userId, decimal amount)
        {
            var wallet = await GetByUserIdAsync(userId);
            if (wallet is null) return null;

            wallet.Balance += amount;
            await UpdateAsync(wallet);
            return wallet;
        }
    }
}
