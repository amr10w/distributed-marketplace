using Microsoft.AspNetCore.Mvc;
using MarketPlace.Domain.Entities;
using MarketPlace.Domain.Repositories;
using System.Threading.Tasks;

namespace MarketPlace.Backend.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserRepository _userRepository;
        private readonly IStoreRepository _storeRepository;
        private readonly IWalletRepository _walletRepository;

        // Inject the repositories directly
        public AuthController(
            IUserRepository userRepository,
            IStoreRepository storeRepository,
            IWalletRepository walletRepository)
        {
            _userRepository = userRepository;
            _storeRepository = storeRepository;
            _walletRepository = walletRepository;
        }

        // --- DTOs for the incoming JSON requests ---
        public class LoginRequest
        {
            public string Username { get; set; }
            public string Password { get; set; }
        }

        public class RegisterRequest
        {
            public string Username { get; set; }
            public string Email { get; set; }
            public string Password { get; set; }
        }

        // ------------------------------------------------
        // POST: /api/auth/login
        // ------------------------------------------------
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // 1. Validate Input
            if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            {
                // Returns HTTP 400 Bad Request
                return BadRequest(new { message = "Username and password are required.", code = "INVALID_INPUT" });
            }

            // 2. Fetch User
            var user = await _userRepository.GetByUsernameAsync(request.Username);

            // 3. Verify Identity (Combining Not Found and Bad Password for security)
            if (user == null || user.PasswordHash != request.Password)
            {
                // Returns HTTP 401 Unauthorized (Triggers Frontend Axios Interceptor)
                return Unauthorized(new { message = "Invalid username or password.", code = "AUTH_FAILED" });
            }

            // 4. Fetch related data
            var store = await _storeRepository.GetByOwnerIdAsync(user.UserId);
            var wallet = await _walletRepository.GetByUserIdAsync(user.UserId);

            // 5. Return HTTP 200 OK with plain JSON (No Envelope)
            return Ok(new
            {
                userId = user.UserId,
                username = user.Username,
                storeId = store?.StoreId,
                storeName = store?.StoreName,
                balance = wallet?.Balance ?? 0m
            });
        }

        // ------------------------------------------------
        // POST: /api/auth/register
        // ------------------------------------------------
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            // 1. Validate Input
            if (string.IsNullOrWhiteSpace(request.Username) ||
                string.IsNullOrWhiteSpace(request.Password) ||
                string.IsNullOrWhiteSpace(request.Email))
            {
                // Returns HTTP 400 Bad Request
                return BadRequest(new { message = "Username, email, and password are required.", code = "INVALID_INPUT" });
            }

            // 2. Check for duplicates
            var existingUser = await _userRepository.GetByUsernameAsync(request.Username);
            if (existingUser != null)
            {
                // Returns HTTP 409 Conflict
                return Conflict(new { message = "Username already exists.", code = "REGISTRATION_FAILED" });
            }

            var existingEmailUser = await _userRepository.GetByEmailAsync(request.Email);
            if (existingEmailUser != null)
            {
                // Returns HTTP 409 Conflict
                return Conflict(new { message = "Email already exists.", code = "REGISTRATION_FAILED" });
            }

            // 3. Create User Entity
            var user = new User
            {
                Username = request.Username,
                PasswordHash = request.Password,
                Email = request.Email
            };
            await _userRepository.AddAsync(user);

            // 4. Create Wallet Entity
            var wallet = new Wallet
            {
                UserId = user.UserId,
                Balance = 0
            };
            await _walletRepository.AddAsync(wallet);

            // 5. Return HTTP 201 Created with plain JSON
            return StatusCode(201, new
            {
                userId = user.UserId,
                username = user.Username
            });
        }
    }
}