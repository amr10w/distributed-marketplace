using System;

namespace MarketPlace.Domain.Exceptions
{
    public class InsufficientFundsException : Exception
    {
        public InsufficientFundsException(Guid userId, decimal attemptedAmount, decimal actualBalance)
            : base($"User {userId} attempted to spend {attemptedAmount} but only has {actualBalance}.")
        {
        }
    }
}