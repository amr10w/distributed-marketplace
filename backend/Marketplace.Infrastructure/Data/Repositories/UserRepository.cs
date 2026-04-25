using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using MarketPlace.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly AppDbContext _db;
        public UserRepository(AppDbContext db) { _db = db; }

        public async Task<User?> GetByIdAsync(int id)
            => await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == id);

        // LoginCommandHandler uses this — unique index on Username makes it one index seek
        public async Task<User?> GetByUsernameAsync(string username)
            => await _db.Users.AsNoTracking()
                              .FirstOrDefaultAsync(u => u.Username == username);

        public async Task<User?> GetByEmailAsync(string email)
            => await _db.Users.AsNoTracking()
                              .FirstOrDefaultAsync(u => u.Email == email);

        public async Task AddAsync(User user)
        {
            _db.Users.Add(user);
            await _db.SaveChangesAsync();
        }

        public async Task UpdateAsync(User user)
        {
            user.UpdatedAt = DateTime.UtcNow;   // bump concurrency token
            _db.Users.Update(user);
            await _db.SaveChangesAsync();
        }
    }
}
