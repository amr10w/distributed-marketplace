using System.Threading.Tasks;
using MarketPlace.Application.DTOs;

namespace MarketPlace.Application.Interfaces
{
    /// <summary>
    /// Defines the contract for routing incoming TCP messages to the correct application logic.
    /// The actual implementation of this lives in the Backend project.
    /// </summary>
    public interface ICommandDispatcher
    {
        Task<JsonEnvelope> DispatchAsync(JsonEnvelope request);
    }
}