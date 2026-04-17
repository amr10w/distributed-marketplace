DROP DATABASE IF EXISTS `marketplace_db`;
CREATE DATABASE `marketplace_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `marketplace_db`;

-- ===================================================================
-- NODE SIDE TABLES
-- Run the section below on each of node1, node2, node3
-- (No Spider engine — plain InnoDB storage)
-- Cross-node FKs (buyer_id, seller_id → User) are omitted intentionally;
-- enforce these at the application level.
-- ===================================================================

CREATE TABLE `Item` (
    `item_id`           INT             NOT NULL,
    `store_id`          INT             NOT NULL,
    `category_id`       INT             NOT NULL,
    `name`              VARCHAR(200)    NOT NULL,
    `brand`             VARCHAR(100)    NULL,
    `description`       TEXT            NULL,
    `price`             DECIMAL(12, 2)  NOT NULL,
    `stock_quantity`    INT             NOT NULL DEFAULT 1,
    `image_url`         VARCHAR(500)    NULL,
    `status`            ENUM(
                            'available',
                            'sold',
                            'removed'
                        )               NOT NULL DEFAULT 'available',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`item_id`),
    INDEX `idx_item_store`      (`store_id`),
    INDEX `idx_item_category`   (`category_id`),
    INDEX `idx_item_status`     (`status`),
    INDEX `idx_item_name_brand` (`name`, `brand`),
    CONSTRAINT `chk_item_price` CHECK (`price` > 0),
    CONSTRAINT `chk_item_stock` CHECK (`stock_quantity` >= 0)
);

-- ============================================================

CREATE TABLE `Transaction` (
    `transaction_id`    INT             NOT NULL,
    `buyer_id`          INT             NOT NULL,
    `seller_id`         INT             NULL,
    `category_id`       INT             NOT NULL,
    `item_id`           INT             NULL,
    `amount`            DECIMAL(12, 2)  NOT NULL,
    `transaction_type`  ENUM(
                            'purchase',
                            'deposit',
                            'refund'
                        )               NOT NULL DEFAULT 'purchase',
    `status`            ENUM(
                            'pending',
                            'completed',
                            'failed',
                            'refunded'
                        )               NOT NULL DEFAULT 'pending',
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`transaction_id`),
    INDEX `idx_txn_buyer`     (`buyer_id`),
    INDEX `idx_txn_seller`    (`seller_id`),
    INDEX `idx_txn_item`      (`item_id`),
    INDEX `idx_txn_status`    (`status`),
    INDEX `idx_txn_timestamp` (`created_at`),
    CONSTRAINT `fk_txn_item`
        FOREIGN KEY (`item_id`) REFERENCES `Item` (`item_id`)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT `chk_txn_amount` CHECK (`amount` > 0)
);

DELIMITER $$
CREATE TRIGGER `trg_transaction_before_insert`
BEFORE INSERT ON `Transaction`
FOR EACH ROW
BEGIN
    IF NEW.`buyer_id` = NEW.`seller_id` THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'buyer_id and seller_id cannot be the same user';
    END IF;
END$$
DELIMITER ;

-- ============================================================

CREATE TABLE `CartItem` (
    `cart_item_id`  INT     NOT NULL AUTO_INCREMENT,
    `cart_id`       INT     NOT NULL,
    `item_id`       INT     NOT NULL,
    `quantity`      INT     NOT NULL DEFAULT 1,
    PRIMARY KEY (`cart_item_id`),
    UNIQUE INDEX `idx_cart_item_unique` (`cart_id`, `item_id`),
    INDEX `idx_cartitem_item` (`item_id`),
    CONSTRAINT `chk_cartitem_qty` CHECK (`quantity` > 0)
);

