CREATE TABLE `User` (
    `user_id` INT PRIMARY KEY AUTO_INCREMENT,
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) UNIQUE NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `phone_number` VARCHAR(20),
    `address` VARCHAR(255),
    `is_active` TINYINT (1) NOT NULL DEFAULT 1,
    `is_verified` TINYINT (1) NOT NULL DEFAULT 0,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE `Two_Factor_Auth` (
    `tfa_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `code` VARCHAR(10) NOT NULL,
    `purpose` VARCHAR(50) NOT NULL,
    `is_used` TINYINT (1) NOT NULL DEFAULT 0,
    `expires_at` DATETIME NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `idx_tfa_user` ON `Two_Factor_Auth` (`user_id`, `purpose`);

CREATE TABLE `Wallet` (
    `wallet_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT UNIQUE NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_wallet_balance` CHECK (`balance` >= 0)
);

CREATE TABLE `Deposit` (
    `deposit_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `method` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `reference_code` VARCHAR(100),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_deposit_amount` CHECK (`amount` > 0)
);

CREATE INDEX `idx_deposit_user` ON `Deposit` (`user_id`);

CREATE TABLE `Category` (
    `category_id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `description` VARCHAR(255),
    `parent_id` INT
);

CREATE INDEX `idx_category_parent` ON `Category` (`parent_id`);

CREATE TABLE `Item` (
    `item_id` INT AUTO_INCREMENT,
    `category_id` INT NOT NULL,
    `seller_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `description` TEXT,
    `brand` VARCHAR(100),
    `price` DECIMAL(10, 2) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'available',
    `image_url` VARCHAR(500),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`item_id`, `category_id`),
    CONSTRAINT `chk_item_price` CHECK (`price` > 0)
);

CREATE INDEX `idx_item_seller` ON `Item` (`seller_id`);

CREATE INDEX `idx_item_status` ON `Item` (`status`);

CREATE TABLE `Inventory` (
    `inventory_id` INT AUTO_INCREMENT,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `quantity_available` INT NOT NULL DEFAULT 0,
    `quantity_sold` INT NOT NULL DEFAULT 0,
    `quantity_reserved` INT NOT NULL DEFAULT 0,
    `last_updated` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`inventory_id`, `category_id`),
    UNIQUE (`item_id`, `category_id`),
    CONSTRAINT `chk_inv_available` CHECK (`quantity_available` >= 0),
    CONSTRAINT `chk_inv_sold` CHECK (`quantity_sold` >= 0),
    CONSTRAINT `chk_inv_reserved` CHECK (`quantity_reserved` >= 0)
);

CREATE TABLE `Cart` (
    `cart_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `idx_cart_user` ON `Cart` (`user_id`);

CREATE INDEX `idx_cart_user_status` ON `Cart` (`user_id`, `status`);

CREATE TABLE `Cart_Item` (
    `cart_item_id` INT PRIMARY KEY AUTO_INCREMENT,
    `cart_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_at_addition` DECIMAL(10, 2) NOT NULL,
    `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (`cart_id`, `item_id`, `category_id`),
    CONSTRAINT `chk_cartitem_qty` CHECK (`quantity` > 0),
    CONSTRAINT `chk_cartitem_price` CHECK (`price_at_addition` > 0)
);

CREATE TABLE `Store` (
    `store_id` INT PRIMARY KEY AUTO_INCREMENT,
    `owner_id` INT NOT NULL,
    `name` VARCHAR(150) NOT NULL,
    `api_key` VARCHAR(255) UNIQUE NOT NULL,
    `webhook_url` VARCHAR(500),
    `is_active` TINYINT (1) NOT NULL DEFAULT 1,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `idx_store_owner` ON `Store` (`owner_id`);

CREATE TABLE `Store_Item` (
    `store_item_id` INT PRIMARY KEY AUTO_INCREMENT,
    `store_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `custom_price` DECIMAL(10, 2),
    `listed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (`store_id`, `item_id`, `category_id`),
    CONSTRAINT `chk_storeitem_price` CHECK (
        `custom_price` IS NULL
        OR `custom_price` > 0
    )
);

CREATE TABLE `Transaction` (
    `transaction_id` INT PRIMARY KEY AUTO_INCREMENT,
    `buyer_id` INT NOT NULL,
    `seller_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `cart_id` INT,
    `quantity` INT NOT NULL DEFAULT 1,
    `amount` DECIMAL(12, 2) NOT NULL,
    `type` VARCHAR(20) NOT NULL DEFAULT 'purchase',
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_txn_amount` CHECK (`amount` > 0),
    CONSTRAINT `chk_txn_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_txn_not_self` CHECK (`buyer_id` <> `seller_id`)
);

CREATE INDEX `idx_txn_buyer` ON `Transaction` (`buyer_id`);

CREATE INDEX `idx_txn_seller` ON `Transaction` (`seller_id`);

CREATE INDEX `idx_txn_item` ON `Transaction` (`item_id`, `category_id`);

CREATE INDEX `idx_txn_status` ON `Transaction` (`status`);

CREATE INDEX `idx_txn_created` ON `Transaction` (`created_at`);

CREATE INDEX `idx_txn_cart` ON `Transaction` (`cart_id`);

CREATE TABLE `Report` (
    `report_id` INT PRIMARY KEY AUTO_INCREMENT,
    `generated_by` INT NOT NULL,
    `type` VARCHAR(50) NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'pending',
    `filters` JSON,
    `file_url` VARCHAR(500),
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `idx_report_user` ON `Report` (`generated_by`);

CREATE TABLE `Message` (
    `message_id` INT PRIMARY KEY AUTO_INCREMENT,
    `sender_id` INT NOT NULL,
    `receiver_id` INT NOT NULL,
    `content` TEXT NOT NULL,
    `is_read` TINYINT (1) NOT NULL DEFAULT 0,
    `sent_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_msg_not_self` CHECK (`sender_id` <> `receiver_id`)
);

CREATE INDEX `idx_msg_sender` ON `Message` (`sender_id`);

CREATE INDEX `idx_msg_receiver` ON `Message` (`receiver_id`);

-- FOREIGN KEYS
ALTER TABLE `Two_Factor_Auth` ADD CONSTRAINT `fk_tfa_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Wallet` ADD CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Deposit` ADD CONSTRAINT `fk_deposit_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Category` ADD CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `Category` (`category_id`) ON DELETE SET NULL;

ALTER TABLE `Item` ADD CONSTRAINT `fk_item_seller` FOREIGN KEY (`seller_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Item` ADD CONSTRAINT `fk_item_category` FOREIGN KEY (`category_id`) REFERENCES `Category` (`category_id`);

ALTER TABLE `Inventory` ADD CONSTRAINT `fk_inventory_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE;

ALTER TABLE `Cart` ADD CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Cart_Item` ADD CONSTRAINT `fk_cartitem_cart` FOREIGN KEY (`cart_id`) REFERENCES `Cart` (`cart_id`) ON DELETE CASCADE;

ALTER TABLE `Cart_Item` ADD CONSTRAINT `fk_cartitem_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE;

ALTER TABLE `Store` ADD CONSTRAINT `fk_store_owner` FOREIGN KEY (`owner_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Store_Item` ADD CONSTRAINT `fk_storeitem_store` FOREIGN KEY (`store_id`) REFERENCES `Store` (`store_id`) ON DELETE CASCADE;

ALTER TABLE `Store_Item` ADD CONSTRAINT `fk_storeitem_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE;

ALTER TABLE `Transaction` ADD CONSTRAINT `fk_txn_buyer` FOREIGN KEY (`buyer_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Transaction` ADD CONSTRAINT `fk_txn_seller` FOREIGN KEY (`seller_id`) REFERENCES `User` (`user_id`);

ALTER TABLE `Transaction` ADD CONSTRAINT `fk_txn_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`);

ALTER TABLE `Transaction` ADD CONSTRAINT `fk_txn_cart` FOREIGN KEY (`cart_id`) REFERENCES `Cart` (`cart_id`) ON DELETE SET NULL;

ALTER TABLE `Report` ADD CONSTRAINT `fk_report_user` FOREIGN KEY (`generated_by`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Message` ADD CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;

ALTER TABLE `Message` ADD CONSTRAINT `fk_msg_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE;