//using System;
//using System.Collections.Concurrent;
//using MarketPlace.Domain.Entities;

//namespace MarketPlace.Infrastructure.Data.Mock
//{
//    /// <summary>
//    /// Acts as our temporary in-memory database. 
//    /// All mock repositories will read and write from these shared static dictionaries.
//    /// </summary>
//    public static class MockDatabaseContext
//    {
//        public static readonly ConcurrentDictionary<Guid, User> Users = new(); // guid = userId
//        public static readonly ConcurrentDictionary<Guid, Item> Items = new();
//        public static readonly ConcurrentDictionary<Guid, Wallet> Wallets = new();
//        public static readonly ConcurrentDictionary<Guid, Transaction> Transactions = new();



//        static MockDatabaseContext()
//        {
//            seedUsers();
//            seedItems();
//            seedWallets();
//        }
//        private static void seedUsers()
//        {
//            var testUser = new User
//            {
//                Id = new Guid("a01"),
//                Username = "testuser",
//                PasswordHash = "TEST!@#$"
//            };

//            var testUser2 = new User
//            {
//                Id = new Guid("a02"),
//                Username = "testuser2",
//                PasswordHash = "TEST!@#$"
//            };
//            Users.TryAdd(testUser.Id, testUser);
//            Users.TryAdd(testUser2.Id, testUser2);
//        }

//        private static void seedItems()
//        {
//            var testItem = new Item
//            {
//                Id = new Guid("b01"),
//                Name = "Test Item",
//                Description = "This is a test item2.",
//                Price = 9.99m,
//                OwnerId = new Guid("a01"),
//                IsAvailable = true
//            };
//            var testItem2 = new Item
//            {
//                Id = new Guid("b02"),
//                Name = "Test Item2",
//                Description = "This is a test item.",
//                Price = 9.99m,
//                OwnerId = new Guid("a02"),
//                IsAvailable = true
//            };
//            Items.TryAdd(testItem.Id, testItem);
//            Items.TryAdd(testItem2.Id, testItem2);
//        }

//        private static void seedWallets()
//        {
//            var testWallet = new Wallet
//            {
//                Id = new Guid("c01"),
//                UserId = new Guid("a01"),
//                Balance = 100.00m
//            };
//            var testWallet2 = new Wallet
//            {
//                Id = new Guid("c02"),
//                UserId = new Guid("a02"),
//                Balance = 100.00m
//            };
//            Wallets.TryAdd(testWallet.Id, testWallet);
//            Wallets.TryAdd(testWallet2.Id, testWallet2);
//        }




//    }
//}