using System;
using System.Threading.Tasks;
using MarketPlace.Domain.Repositories;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly AppDbContext _db;

        public UnitOfWork(AppDbContext db)
        {
            _db = db;
        }

        public async Task ExecuteInTransactionAsync(Func<Task> work)
        {
            var strategy = _db.Database.CreateExecutionStrategy();
            await strategy.ExecuteAsync(async () =>
            {
                // Spider doesn't support SAVEPOINTs; EF would otherwise create one per SaveChanges.
                var previousAutoSavepoints = _db.Database.AutoSavepointsEnabled;
                _db.Database.AutoSavepointsEnabled = false;
                await using var tx = await _db.Database.BeginTransactionAsync();
                try
                {
                    await work();
                    await tx.CommitAsync();
                }
                catch
                {
                    await tx.RollbackAsync();
                    throw;
                }
                finally
                {
                    _db.Database.AutoSavepointsEnabled = previousAutoSavepoints;
                }
            });
        }
    }
}
