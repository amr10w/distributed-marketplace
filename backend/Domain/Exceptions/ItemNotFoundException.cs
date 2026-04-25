using System;

namespace MarketPlace.Domain.Exceptions
{
    public class ItemNotFoundException : Exception
    {
        public ItemNotFoundException(int itemId)
            : base($"The item with ID {itemId} could not be found or is no longer available.")
        {
        }
    }
}