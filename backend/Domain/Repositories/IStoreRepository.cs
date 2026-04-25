using System.Threading.Tasks;
using MarketPlace.Domain.Entities;

namespace MarketPlace.Domain.Repositories
{
    public interface IStoreRepository
    {
        Task<Store?> GetByIdAsync(int storeId);

        Task AddAsync(Store store);
    }
}