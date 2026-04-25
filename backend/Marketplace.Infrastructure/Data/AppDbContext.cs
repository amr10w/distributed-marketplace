using MarketPlace.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace MarketPlace.Infrastructure.Data
{

    public class AppDbContext : DbContext
    {
        public DbSet<User> Users => Set<User>();
        public DbSet<Wallet> Wallets => Set<Wallet>();
        public DbSet<Store> Stores => Set<Store>();
        public DbSet<Category> Categories => Set<Category>();
        public DbSet<Cart> Carts => Set<Cart>();
        public DbSet<CartItem> CartItems => Set<CartItem>();

        public DbSet<Item> Items => Set<Item>();
        public DbSet<Transaction> Transactions => Set<Transaction>();

        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            ConfigureUser(modelBuilder);
            ConfigureWallet(modelBuilder);
            ConfigureStore(modelBuilder);
            ConfigureCategory(modelBuilder);
            ConfigureItem(modelBuilder);
            ConfigureTransaction(modelBuilder);
            ConfigureCart(modelBuilder);
            ConfigureCartItem(modelBuilder);
        }



        private static void ConfigureUser(ModelBuilder b)
        {
            b.Entity<User>(e =>
            {
                e.ToTable("User");
                e.HasKey(u => u.UserId);
                //e.Property(u => u.UserId).HasColumnName("user_id").ValueGeneratedOnAdd();
                e.Property(u => u.UserId).HasColumnName("user_id");
                e.Property(u => u.Username).HasColumnName("username").HasMaxLength(50).IsRequired();
                e.Property(u => u.Email).HasColumnName("email").HasMaxLength(150).IsRequired();
                e.Property(u => u.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
                e.Property(u => u.TwoFactorSecret).HasColumnName("two_factor_secret").HasMaxLength(64);
                e.Property(u => u.IsVerified).HasColumnName("is_verified");
                e.Property(u => u.IsActive).HasColumnName("is_active");
                //e.Property(u => u.ProfileImageUrl).HasColumnName("profile_image_url").HasMaxLength(500);
                e.Property(u => u.CreatedAt).HasColumnName("created_at");


                e.Property(u => u.UpdatedAt)
                 .HasColumnName("updated_at")
                 .IsConcurrencyToken();

                e.HasIndex(u => u.Username).IsUnique();
                e.HasIndex(u => u.Email).IsUnique();
            });
        }

        private static void ConfigureWallet(ModelBuilder b)
        {
            b.Entity<Wallet>(e =>
            {
                e.ToTable("Wallet");
                e.HasKey(w => w.WalletId);
                //e.Property(w => w.WalletId).HasColumnName("wallet_id").ValueGeneratedOnAdd();
                e.Property(w => w.WalletId).HasColumnName("wallet_id");
                e.Property(w => w.UserId).HasColumnName("user_id").IsRequired();
                e.Property(w => w.Balance).HasColumnName("balance").HasColumnType("decimal(12,2)").IsRequired();
                e.Property(w => w.Currency).HasColumnName("currency").HasMaxLength(10).HasDefaultValue("USD");
                e.Property(w => w.CreatedAt).HasColumnName("created_at");
                e.Property(w => w.UpdatedAt).HasColumnName("updated_at").IsConcurrencyToken();

                e.HasIndex(w => w.UserId).IsUnique();
            });
        }

        private static void ConfigureStore(ModelBuilder b)
        {
            b.Entity<Store>(e =>
            {
                e.ToTable("Store");
                e.HasKey(s => s.StoreId);
                //e.Property(s => s.StoreId).HasColumnName("store_id").ValueGeneratedOnAdd();
                e.Property(s => s.StoreId).HasColumnName("store_id");
                e.Property(s => s.OwnerId).HasColumnName("owner_id").IsRequired();
                e.Property(s => s.StoreName).HasColumnName("store_name").HasMaxLength(150).IsRequired();
                e.Property(s => s.Description).HasColumnName("description").HasMaxLength(500);
                e.Property(s => s.LogoUrl).HasColumnName("logo_url").HasMaxLength(500);
                e.Property(s => s.IsActive).HasColumnName("is_active");
                e.Property(s => s.CreatedAt).HasColumnName("created_at");
            });
        }

        private static void ConfigureCategory(ModelBuilder b)
        {
            b.Entity<Category>(e =>
            {
                e.ToTable("Category");
                e.HasKey(c => c.CategoryId);
                //e.Property(c => c.CategoryId).HasColumnName("category_id").ValueGeneratedOnAdd();
                e.Property(c => c.CategoryId).HasColumnName("category_id");
                e.Property(c => c.Name).HasColumnName("name").HasMaxLength(100).IsRequired();
                e.Property(c => c.ParentId).HasColumnName("parent_id");
                e.Property(c => c.Description).HasColumnName("description").HasMaxLength(250);

                e.HasOne(c => c.Parent)
                 .WithMany(c => c.Children)
                 .HasForeignKey(c => c.ParentId)
                 .OnDelete(DeleteBehavior.Restrict);
            });
        }

        private static void ConfigureItem(ModelBuilder b)
        {
            b.Entity<Item>(e =>
            {
                e.ToTable("Item");
                e.HasKey(i => i.ItemId);
                //e.Property(i => i.ItemId).HasColumnName("item_id").ValueGeneratedOnAdd();
                e.Property(i => i.ItemId).HasColumnName("item_id");
                e.Property(i => i.StoreId).HasColumnName("store_id").IsRequired();
                e.Property(i => i.CategoryId).HasColumnName("category_id").IsRequired();
                e.Property(i => i.Name).HasColumnName("name").HasMaxLength(200).IsRequired();
                e.Property(i => i.Brand).HasColumnName("brand").HasMaxLength(200);
                e.Property(i => i.Description).HasColumnName("description");
                e.Property(i => i.Price).HasColumnName("price").HasColumnType("decimal(12,2)").IsRequired();
                e.Property(i => i.StockQuantity).HasColumnName("stock_quantity").IsRequired();
                e.Property(i => i.ImageUrl).HasColumnName("image_url").HasMaxLength(500);
                e.Property(i => i.Status).HasColumnName("status")
                 .HasConversion<string>()
                 .HasMaxLength(20);
                e.Property(i => i.CreatedAt).HasColumnName("created_at");
                e.Property(i => i.UpdatedAt).HasColumnName("updated_at").IsConcurrencyToken();


                e.Ignore(i => i.IsAvailable);

                e.HasIndex(i => i.CategoryId);
                e.HasIndex(i => i.StoreId);
            });
        }

        private static void ConfigureTransaction(ModelBuilder b)
        {
            b.Entity<Transaction>(e =>
            {
                e.ToTable("Transaction");
                e.HasKey(t => t.TransactionId);
                //e.Property(t => t.TransactionId).HasColumnName("transaction_id").ValueGeneratedOnAdd();
                e.Property(t => t.TransactionId).HasColumnName("transaction_id");
                e.Property(t => t.BuyerId).HasColumnName("buyer_id").IsRequired();
                e.Property(t => t.SellerId).HasColumnName("seller_id");
                e.Property(t => t.CategoryId).HasColumnName("category_id");
                e.Property(t => t.ItemId).HasColumnName("item_id");
                e.Property(t => t.Amount).HasColumnName("amount").HasColumnType("decimal(12,2)").IsRequired();
                e.Property(t => t.TransactionType).HasColumnName("transaction_type")
                 .HasConversion<string>().HasMaxLength(20);
                e.Property(t => t.Status).HasColumnName("status")
                 .HasConversion<string>().HasMaxLength(20);
                e.Property(t => t.CreatedAt).HasColumnName("created_at");
                e.Property(t => t.UpdatedAt).HasColumnName("updated_at");

                e.HasIndex(t => t.BuyerId);
                e.HasIndex(t => t.SellerId);
                e.HasIndex(t => t.CategoryId);
                e.HasIndex(t => t.ItemId);
                e.HasIndex(t => t.CreatedAt);
            });
        }

        private static void ConfigureCart(ModelBuilder b)
        {
            b.Entity<Cart>(e =>
            {
                e.ToTable("Cart");
                e.HasKey(c => c.CartId);
                e.Property(c => c.CartId).HasColumnName("cart_id");
                e.Property(c => c.UserId).HasColumnName("user_id").IsRequired();
                e.Property(c => c.CreatedAt).HasColumnName("created_at");
                e.Property(c => c.UpdatedAt).HasColumnName("updated_at").IsConcurrencyToken();
                e.Property(c => c.Status).HasColumnName("status")
                 .HasConversion<string>()
                 .HasMaxLength(20);
                e.HasMany(c => c.Items)
                 .WithOne()
                 .HasForeignKey(ci => ci.CartId);

                e.HasIndex(c => c.UserId).IsUnique();
            });
        }

        private static void ConfigureCartItem(ModelBuilder b)
        {
            b.Entity<CartItem>(e =>
            {
                e.ToTable("CartItem");
                e.HasKey(ci => ci.CartItemId);
                //e.Property(ci => ci.CartItemId).HasColumnName("cart_item_id").ValueGeneratedOnAdd();
                e.Property(ci => ci.CartItemId).HasColumnName("cart_item_id");
                e.Property(ci => ci.CartId).HasColumnName("cart_id").IsRequired();
                e.Property(ci => ci.ItemId).HasColumnName("item_id").IsRequired();
                e.Property(ci => ci.Quantity).HasColumnName("quantity").IsRequired();

                e.HasIndex(ci => ci.CartId);
                e.HasIndex(ci => ci.ItemId);
            });
        }
    }
}
