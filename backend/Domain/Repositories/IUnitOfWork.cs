using System;
using System.Threading.Tasks;

namespace MarketPlace.Domain.Repositories
{
    public interface IUnitOfWork
    {
        Task ExecuteInTransactionAsync(Func<Task> work);
    }
}
