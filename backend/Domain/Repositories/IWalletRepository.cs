using System;
using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface IWalletRepository
    {
        Task<Wallet?> GetByUserIdAsync(int userId);
        Task UpdateAsync(Wallet wallet);

        Task AddAsync(Wallet wallet);

        Task<Wallet?> DepositAsync(int userId, decimal amount);
    }
}