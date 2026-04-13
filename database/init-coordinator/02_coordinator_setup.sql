-- 02_coordinator_setup.sql (For Coordinator Node Only)
-- ==========================================
-- PART 1: ENABLE SPIDER & CONNECT TO NODES
-- ==========================================
INSTALL SONAME 'ha_spider';

-- Define the connections to your Docker containers
CREATE SERVER node1 FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_1',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

CREATE SERVER node2 FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_2',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

CREATE SERVER node3 FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_3',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

-- ==========================================
-- PART 2: GLOBAL TABLES (Stored Locally)
-- ==========================================
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

CREATE TABLE `Category` (
    `category_id` INT PRIMARY KEY AUTO_INCREMENT,
    `name` VARCHAR(100) UNIQUE NOT NULL,
    `description` VARCHAR(255),
    `parent_id` INT,
    CONSTRAINT `fk_category_parent` FOREIGN KEY (`parent_id`) REFERENCES `Category` (`category_id`) ON DELETE SET NULL
);

CREATE INDEX `idx_category_parent` ON `Category` (`parent_id`);

CREATE TABLE `Wallet` (
    `wallet_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT UNIQUE NOT NULL,
    `balance` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `chk_wallet_balance` CHECK (`balance` >= 0),
    CONSTRAINT `fk_wallet_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
);

CREATE TABLE `Cart` (
    `cart_id` INT PRIMARY KEY AUTO_INCREMENT,
    `user_id` INT NOT NULL,
    `status` VARCHAR(20) NOT NULL DEFAULT 'active',
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`) ON DELETE CASCADE
);

CREATE INDEX `idx_cart_user` ON `Cart` (`user_id`);

-- ==========================================
-- PART 3: SPIDER ROUTING TABLES 
-- (These hold no data, they just route queries)
-- ==========================================
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
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "Item"'
PARTITION BY
    HASH (`category_id`) (
        PARTITION p1 COMMENT = 'srv "node1"',
        PARTITION p2 COMMENT = 'srv "node2"',
        PARTITION p3 COMMENT = 'srv "node3"'
    );

CREATE TABLE `Transaction` (
    `transaction_id` INT AUTO_INCREMENT,
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
    PRIMARY KEY (`transaction_id`, `category_id`),
    CONSTRAINT `chk_txn_amount` CHECK (`amount` > 0),
    CONSTRAINT `chk_txn_quantity` CHECK (`quantity` > 0),
    CONSTRAINT `chk_txn_not_self` CHECK (`buyer_id` <> `seller_id`)
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "Transaction"'
PARTITION BY
    HASH (`category_id`) (
        PARTITION p1 COMMENT = 'srv "node1"',
        PARTITION p2 COMMENT = 'srv "node2"',
        PARTITION p3 COMMENT = 'srv "node3"'
    );

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
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "Inventory"'
PARTITION BY
    HASH (`category_id`) (
        PARTITION p1 COMMENT = 'srv "node1"',
        PARTITION p2 COMMENT = 'srv "node2"',
        PARTITION p3 COMMENT = 'srv "node3"'
    );