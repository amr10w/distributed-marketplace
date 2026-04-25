using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface ICartRepository
    {
        Task<Cart?> GetByIdAsync(int cartId);
        Task<Cart?> GetByUserIdAsync(int userId);
        Task AddAsync(Cart cart);
        Task UpdateAsync(Cart cart);
        Task DeleteAsync(int cartId);
    }
}