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
    internal class CartRepository : ICartRepository
    {
        private readonly AppDbContext _db;
        public  CartRepository(AppDbContext db)
        {
            _db = db;
        }
        public async Task AddAsync(Cart cart)
        {
            _db.Carts.Add(cart);
            await _db.SaveChangesAsync();
        }

        public async Task DeleteAsync(int cartId)
        {
            var cart = await _db.Carts.FindAsync(cartId);
            if (cart != null)
            {
                _db.Carts.Remove(cart);
                await _db.SaveChangesAsync();
            }
        }

        public async Task<Cart?> GetByIdAsync(int cartId)
        {
            return await _db.Carts
                            .Include(c => c.Items) 
                            .FirstOrDefaultAsync(c => c.CartId == cartId);
        }

        public async Task<Cart?> GetByUserIdAsync(int userId)
        {
            return await _db.Carts
                            .Include(c => c.Items)
                            .FirstOrDefaultAsync(c => c.UserId == userId && c.Status == CartStatus.active);
        }

        public async Task UpdateAsync(Cart cart)
        {
            _db.Carts.Update(cart);
            await _db.SaveChangesAsync();
        }
    }
}
