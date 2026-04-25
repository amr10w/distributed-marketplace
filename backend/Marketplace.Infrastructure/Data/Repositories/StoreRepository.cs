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
    internal class StoreRepository : IStoreRepository
    {
        private readonly AppDbContext _db;
        public StoreRepository(AppDbContext db)
        {
            _db = db;
        }
        public async Task AddAsync(Store store)
        {
            _db.Stores.Add(store);
            await _db.SaveChangesAsync();
        }

        public async Task<Store?> GetByIdAsync(int storeId)
        {
            return await _db.Stores
                            .AsNoTracking() // Good practice for read-only queries
                            .FirstOrDefaultAsync(s => s.StoreId == storeId);
        }
    }
}
