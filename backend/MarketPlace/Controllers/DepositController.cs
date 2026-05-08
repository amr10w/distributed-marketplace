using Microsoft.AspNetCore.Mvc;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace MarketPlace.Backend.Controllers
{
    [ApiController]
    [Route("api/wallet")] 
    public class DepositController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IWalletRepository _walletRepository;
        private readonly IReportLogRepository _reportLogRepository;

        public DepositController(
            IUserRepository userRepository,
            IWalletRepository walletRepository,
            IReportLogRepository reportLogRepository)
        {
            _userRepository = userRepository;
            _walletRepository = walletRepository;
            _reportLogRepository = reportLogRepository;
        }

        public class DepositRequest
        {
            public int UserId { get; set; }
            public decimal Amount { get; set; }
        }

        [HttpPost("deposit")]
        public async Task<IActionResult> Deposit([FromBody] DepositRequest request)
        {
            // 1. Validate Input
            if (request.Amount <= 0)
            {
                return BadRequest(new { message = "Deposit amount must be greater than zero.", code = "INVALID_AMOUNT" });
            }

            // 2. Fetch User
            var user = await _userRepository.GetByIdAsync(request.UserId);
            if (user == null)
            {
                return NotFound(new { message = "User not found.", code = "USER_NOT_FOUND" });
            }

            // 3. Execute Deposit
            var wallet = await _walletRepository.DepositAsync(user.UserId, request.Amount);
            if (wallet == null)
            {
                return NotFound(new { message = "Wallet not found for user.", code = "WALLET_NOT_FOUND" });
            }

            // 4. Create the Report Log (Keeping your reporting logic intact!)
            var reportLog = new ReportLog
            {
                GeneratedBy = user.UserId,
                ReportType = ReportType.DepositCash,
                Parameters = JsonSerializer.Serialize(new
                {
                    UserId = user.UserId,
                    Amount = request.Amount
                }),
                ResultSnapshot = JsonSerializer.Serialize(new
                {
                    NewBalance = wallet.Balance,
                    Status = "completed"
                }),
                GeneratedAt = DateTime.UtcNow
            };
            await _reportLogRepository.AddAsync(reportLog);

            // 5. Return HTTP 200 OK
            return Ok(new
            {
                newBalance = wallet.Balance
            });
        }
    }
}