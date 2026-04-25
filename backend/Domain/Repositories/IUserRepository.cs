using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface IUserRepository
    {
        /// Retrieves a user by their unique identifier.
        Task<User?> GetByIdAsync(int id);

        /// Retrieves a user by their username (useful for login).
        Task<User?> GetByUsernameAsync(string username);

        Task<User?> GetByEmailAsync(string email);
        /// Updates the user's data (e.g., after deducting wallet balance).
        Task UpdateAsync(User user);

        Task AddAsync(User user);
    }
}
