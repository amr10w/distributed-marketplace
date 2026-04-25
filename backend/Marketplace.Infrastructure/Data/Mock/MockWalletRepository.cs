//using System;
//using System.Linq;
//using System.Threading.Tasks;
//using MarketPlace.Domain.Entities;
//using MarketPlace.Domain.Repositories;

//namespace MarketPlace.Infrastructure.Data.Mock
//{
//    public class MockWalletRepository : IWalletRepository
//    {
//        private static readonly object _walletLock = new();

//        public Task<Wallet?> GetByUserIdAsync(Guid userId)
//        {
//            var wallet = MockDatabaseContext.Wallets.Values.FirstOrDefault(w => w.UserId == userId);
//            return Task.FromResult(wallet);
//        }

//        public Task UpdateAsync(Wallet wallet)
//        {
//            MockDatabaseContext.Wallets.AddOrUpdate(wallet.Id, wallet, (key, old) => wallet);
//            return Task.CompletedTask;
//        }

//        public Task AddAsync(Wallet wallet)
//        {
//            MockDatabaseContext.Wallets.TryAdd(wallet.Id, wallet);
//            return Task.CompletedTask;
//        }

//        public Task<Wallet?> DepositAsync(Guid userId, decimal amount)
//        {
//            lock (_walletLock)
//            {
//                var wallet = MockDatabaseContext.Wallets.Values
//                    .FirstOrDefault(w => w.UserId == userId);

//                if (wallet == null)
//                    return Task.FromResult<Wallet?>(null);

//                wallet.Balance += amount;
//                MockDatabaseContext.Wallets[wallet.Id] = wallet;

//                return Task.FromResult<Wallet?>(wallet);
//            }
//        }
//    }
//}