using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    /// <summary>
    /// 
    /// </summary>
    public class ItemRepository : IItemRepository
    {
        private readonly AppDbContext _db;
        public ItemRepository(AppDbContext db) { _db = db; }


        public async Task<Item?> GetByIdAsync(int id)
            => await _db.Items.FirstOrDefaultAsync(i => i.ItemId == id);

        public async Task AddAsync(Item item)
        {
            if (item.CategoryId == 0)
                throw new InvalidOperationException(
                    "Item.CategoryId must be set before saving. " +
                    "It is the shard key — Spider uses it to pick the storage node.");

            _db.Items.Add(item);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(Item item)
        {
            item.UpdatedAt = DateTime.UtcNow;   
            _db.Items.Update(item);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var item = await _db.Items.FindAsync(id);
            if (item is not null)
            {
                _db.Items.Remove(item);
                await _db.SaveChangesAsync();
            }
        }


        public async Task<IEnumerable<Item>> SearchAvailableItemsAsync(string searchTerm)
        {
            var query = _db.Items
                           .AsNoTracking()
                           .Where(i => i.StockQuantity > 0 && i.Status == ItemStatus.available);

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var term = searchTerm.ToLower();
                query = query.Where(i =>
                    EF.Functions.Like(i.Name, $"%{term}%") ||
                    EF.Functions.Like(i.Brand, $"%{term}%") ||
                    EF.Functions.Like(i.Description, $"%{term}%"));
            }

            return await query.ToListAsync();
        }

        public async Task<IEnumerable<Item>> GetItemsByStoreIdAsync(int storeId)
            => await _db.Items
                        .AsNoTracking()
                        .Where(i => i.StoreId == storeId)
                        .ToListAsync();


        public async Task<IEnumerable<Item>> GetItemsByCategoryAsync(int categoryId)
            => await _db.Items
                        .AsNoTracking()
                        .Where(i => i.CategoryId == categoryId && i.StockQuantity > 0)
                        .ToListAsync();

        public async Task<IEnumerable<Item>> GetItemsByOwnerIdAsync(int ownerId)
        {
            var storeIds = await _db.Stores
                            .AsNoTracking()
                            .Where(s => s.OwnerId == ownerId)
                            .Select(s => s.StoreId)
                            .ToListAsync();

            return await _db.Items
                            .AsNoTracking()
                            .Where(i => storeIds.Contains(i.StoreId))
                            .ToListAsync();
        }
    }
}
