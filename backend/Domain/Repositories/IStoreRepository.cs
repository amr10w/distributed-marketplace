using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface IStoreRepository
    {
        Task<Store?> GetByIdAsync(int storeId);

        Task<Store?> GetByOwnerIdAsync(int ownerId);

        Task AddAsync(Store store);
    }
}