//using MarketPlace.Domain.Entities;
//using MarketPlace.Domain.Repositories;
//using System;
//using System.Collections.Concurrent;
//using System.Threading.Tasks;

//namespace MarketPlace.Infrastructure.Data.Mock
//{
//    /// <summary>
//    /// 
//    /// </summary>
//    public class MockUserRepository : IUserRepository
//    {


//        public Task<User?> GetByIdAsync(Guid id)
//        {
//            MockDatabaseContext.Users.TryGetValue(id, out var user);
//            return Task.FromResult(user);
//        }

//        public Task<User?> GetByUsernameAsync(string username)
//        {
//            var user = MockDatabaseContext.Users.Values.
//                FirstOrDefault(u => u.Username.Equals(username, StringComparison.OrdinalIgnoreCase));

//            return Task.FromResult(user);
//        }

//        public Task UpdateAsync(User user)
//        {
//            MockDatabaseContext.Users.AddOrUpdate(user.Id, user, (key, oldValue) => user);
//            return Task.CompletedTask;
//        }

//        public Task AddAsync(User user)
//        {
//            MockDatabaseContext.Users.TryAdd(user.Id, user);
//            return Task.CompletedTask;
//        }
//    }
//}