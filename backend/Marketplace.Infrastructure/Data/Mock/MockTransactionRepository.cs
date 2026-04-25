//using System;
//using System.Collections.Generic;
//using System.Threading.Tasks;
//using MarketPlace.Domain.Entities;
//using MarketPlace.Domain.Repositories;

//namespace MarketPlace.Infrastructure.Data.Mock
//{
//    public class MockTransactionRepository : ITransactionRepository
//    {
//        public Task AddAsync(Transaction transaction)
//        {
//            MockDatabaseContext.Transactions.TryAdd(transaction.Id, transaction);
//            return Task.CompletedTask;
//        }

//        public Task UpdateAsync(Transaction transaction)
//        {
//            MockDatabaseContext.Transactions.
//                AddOrUpdate(transaction.Id, transaction, (key, old) => transaction);
//            return Task.CompletedTask;
//        }

//        public Task<Transaction?> GetByIdAsync(Guid id)
//        {
//            MockDatabaseContext.Transactions.TryGetValue(id, out var transaction);
//            return Task.FromResult(transaction);
//        }

//        public Task<IEnumerable<Transaction>> GetAllTransactionsForReportAsync()
//        {
//            var transactions = MockDatabaseContext.Transactions.Values.ToList();
//            return Task.FromResult<IEnumerable<Transaction>>(transactions);
//        }

//        public Task<IEnumerable<Transaction>> GetByUserIdAsync(Guid userId)
//        {
//            var results = MockDatabaseContext.Transactions.Values
//                .Where(t => t.BuyerId == userId || t.SellerId == userId)
//                .ToList();

//            return Task.FromResult<IEnumerable<Transaction>>(results);
//        }
//    }
//}