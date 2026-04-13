-- 01_shard_tables.sql (For Data Nodes Only)
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
    CONSTRAINT `chk_inv_reserved` CHECK (`quantity_reserved` >= 0),
    -- Local FK is allowed because both tables live on this node
    CONSTRAINT `fk_inventory_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE
);

CREATE TABLE `Cart_Item` (
    `cart_item_id` INT AUTO_INCREMENT,
    `cart_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `quantity` INT NOT NULL DEFAULT 1,
    `price_at_addition` DECIMAL(10, 2) NOT NULL,
    `added_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_item_id`, `category_id`),
    UNIQUE (`cart_id`, `item_id`, `category_id`),
    CONSTRAINT `chk_cartitem_qty` CHECK (`quantity` > 0),
    CONSTRAINT `chk_cartitem_price` CHECK (`price_at_addition` > 0),
    CONSTRAINT `fk_cartitem_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE
);

CREATE TABLE `Store_Item` (
    `store_item_id` INT AUTO_INCREMENT,
    `store_id` INT NOT NULL,
    `item_id` INT NOT NULL,
    `category_id` INT NOT NULL,
    `custom_price` DECIMAL(10, 2),
    `listed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`store_item_id`, `category_id`),
    UNIQUE (`store_id`, `item_id`, `category_id`),
    CONSTRAINT `chk_storeitem_price` CHECK (
        `custom_price` IS NULL
        OR `custom_price` > 0
    ),
    CONSTRAINT `fk_storeitem_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`) ON DELETE CASCADE
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
    CONSTRAINT `chk_txn_not_self` CHECK (`buyer_id` <> `seller_id`),
    CONSTRAINT `fk_txn_item` FOREIGN KEY (`item_id`, `category_id`) REFERENCES `Item` (`item_id`, `category_id`)
);

CREATE INDEX `idx_txn_buyer` ON `Transaction` (`buyer_id`);

CREATE INDEX `idx_txn_seller` ON `Transaction` (`seller_id`);

CREATE INDEX `idx_txn_item` ON `Transaction` (`item_id`, `category_id`);

CREATE INDEX `idx_txn_status` ON `Transaction` (`status`);

CREATE INDEX `idx_txn_created` ON `Transaction` (`created_at`);

CREATE INDEX `idx_txn_cart` ON `Transaction` (`cart_id`);