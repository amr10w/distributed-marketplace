-- 01_coordinator_setup.sql (For Coordinator Node Only)
-- ==========================================
-- PART 1: ENABLE SPIDER & CONNECT TO NODES
-- ==========================================
INSTALL SONAME 'ha_spider';

-- Define the connections to your Docker containers
CREATE SERVER `node1` FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_1',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

CREATE SERVER `node2` FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_2',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

CREATE SERVER `node3` FOREIGN DATA WRAPPER mysql OPTIONS (
    HOST 'marketplace_node_3',
    DATABASE 'marketplace_db',
    USER 'root',
    PASSWORD 'root_password',
    PORT 3306
);

-- Drop and recreate the database for a clean slate
DROP DATABASE IF EXISTS `marketplace_db`;
CREATE DATABASE `marketplace_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `marketplace_db`;

-- ============================================================
-- COORDINATOR TABLES (non-distributed, live only on coordinator)
-- ============================================================

CREATE TABLE `Category` (
    `category_id`   INT             NOT NULL AUTO_INCREMENT,
    `name`          VARCHAR(100)    NOT NULL UNIQUE,
    `parent_id`     INT             NULL,
    `description`   VARCHAR(255)    NULL,
    PRIMARY KEY (`category_id`),
    INDEX `idx_category_parent` (`parent_id`),
    CONSTRAINT `fk_category_parent`
        FOREIGN KEY (`parent_id`) REFERENCES `Category` (`category_id`)
        ON DELETE SET NULL
);

-- ============================================================

CREATE TABLE `User` (
    `user_id`           INT             NOT NULL AUTO_INCREMENT,
    `username`          VARCHAR(50)     NOT NULL UNIQUE,
    `email`             VARCHAR(150)    NOT NULL UNIQUE,
    `password_hash`     VARCHAR(255)    NOT NULL,
    `two_factor_secret` VARCHAR(64)     NULL,
    `is_verified`       TINYINT(1)      NOT NULL DEFAULT 0,
    `is_active`         TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`user_id`),
    INDEX `idx_user_email`    (`email`),
    INDEX `idx_user_username` (`username`)
);

-- ============================================================

CREATE TABLE `Store` (
    `store_id`      INT             NOT NULL AUTO_INCREMENT,
    `owner_id`      INT             NOT NULL,
    `store_name`    VARCHAR(150)    NOT NULL,
    `description`   VARCHAR(500)    NULL,
    `logo_url`      VARCHAR(500)    NULL,
    `is_active`     TINYINT(1)      NOT NULL DEFAULT 1,
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`store_id`),
    INDEX `idx_store_owner` (`owner_id`),
    CONSTRAINT `fk_store_owner`
        FOREIGN KEY (`owner_id`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================

CREATE TABLE `Wallet` (
    `wallet_id`     INT             NOT NULL AUTO_INCREMENT,
    `user_id`       INT             NOT NULL UNIQUE,
    `balance`       DECIMAL(12, 2)  NOT NULL DEFAULT 0.00,
    `currency`      VARCHAR(10)     NOT NULL DEFAULT 'USD',
    `created_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`wallet_id`),
    INDEX `idx_wallet_user` (`user_id`),
    CONSTRAINT `fk_wallet_user`
        FOREIGN KEY (`user_id`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `chk_wallet_balance` CHECK (`balance` >= 0)
);

-- ============================================================

CREATE TABLE `Cart` (
    `cart_id`       INT         NOT NULL AUTO_INCREMENT,
    `user_id`       INT         NOT NULL,
    `status`        ENUM(
                        'active',
                        'checked_out',
                        'abandoned'
                    )           NOT NULL DEFAULT 'active',
    `created_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`    DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                        ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`cart_id`),
    INDEX `idx_cart_user` (`user_id`)
);

-- ============================================================

CREATE TABLE `ReportLog` (
    `report_id`         INT             NOT NULL AUTO_INCREMENT,
    `generated_by`      INT             NOT NULL,
    `report_type`       ENUM(
                            'transaction_summary',
                            'user_activity',
                            'inventory_status',
                            'revenue_by_category',
                            'top_sellers',
                            'custom',
                            'checkout',
                            'deposit_cash'
                        )               NOT NULL,
    `parameters`        JSON            NULL,
    `result_snapshot`   JSON            NULL,
    `generated_at`      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`report_id`),
    INDEX `idx_report_user` (`generated_by`),
    INDEX `idx_report_type` (`report_type`),
    INDEX `idx_report_date` (`generated_at`),
    CONSTRAINT `fk_generatedby_user`
        FOREIGN KEY (`generated_by`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- Conversation must be created BEFORE Message (Message has FK to Conversation)
-- ============================================================

CREATE TABLE `Conversation` (
    `conversation_id`   INT         NOT NULL AUTO_INCREMENT,
    `user1_id`          INT         NOT NULL,
    `user2_id`          INT         NOT NULL,
    `item_id`           INT         NULL,
    `created_at`        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at`        DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP
                            ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`conversation_id`),
    UNIQUE  INDEX `idx_conv_unique` (`user1_id`, `user2_id`, `item_id`),
    INDEX `idx_conv_user1` (`user1_id`),
    INDEX `idx_conv_user2` (`user2_id`),
    INDEX `idx_conv_item`  (`item_id`),
    CONSTRAINT `fk_conv_user1`
        FOREIGN KEY (`user1_id`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_conv_user2`
        FOREIGN KEY (`user2_id`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

DELIMITER $$
CREATE TRIGGER `trg_conversation_before_insert`
BEFORE INSERT ON `Conversation`
FOR EACH ROW
BEGIN
    IF NEW.`user1_id` = NEW.`user2_id` THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'A user cannot start a conversation with themselves';
    END IF;
END$$
DELIMITER ;

-- ============================================================

CREATE TABLE `Message` (
    `message_id`        INT         NOT NULL AUTO_INCREMENT,
    `conversation_id`   INT         NOT NULL,
    `sender_id`         INT         NOT NULL,
    `body`              TEXT        NOT NULL,
    `is_read`           TINYINT(1)  NOT NULL DEFAULT 0,
    `sent_at`           DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`message_id`),
    INDEX `idx_msg_conversation` (`conversation_id`),
    INDEX `idx_msg_sender`       (`sender_id`),
    INDEX `idx_msg_sent_at`      (`sent_at`),
    INDEX `idx_msg_unread`       (`conversation_id`, `is_read`),
    CONSTRAINT `fk_msg_conversation`
        FOREIGN KEY (`conversation_id`) REFERENCES `Conversation` (`conversation_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
    CONSTRAINT `fk_msg_sender`
        FOREIGN KEY (`sender_id`) REFERENCES `User` (`user_id`)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ============================================================
-- DISTRIBUTED TABLES (Spider engine — partitioned by category_id)
-- These route data to node1, node2, node3 via HASH(category_id)
-- Foreign keys to User and Category are NOT enforced by Spider;
-- enforce them at the application level or via coordinator triggers.
-- ============================================================

CREATE TABLE `Item` (
    `item_id`           INT             NOT NULL AUTO_INCREMENT,
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
    PRIMARY KEY (`item_id`,`category_id`),
    INDEX `idx_item_store`      (`store_id`),
    INDEX `idx_item_category`   (`category_id`),
    INDEX `idx_item_status`     (`status`),
    INDEX `idx_item_name_brand` (`name`, `brand`),
    CONSTRAINT `chk_item_price` CHECK (`price` > 0),
    CONSTRAINT `chk_item_stock` CHECK (`stock_quantity` >= 0)
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "Item"'
PARTITION BY HASH (`category_id`) (
    PARTITION `p1` COMMENT = 'srv "node1"',
    PARTITION `p2` COMMENT = 'srv "node2"',
    PARTITION `p3` COMMENT = 'srv "node3"'
);

-- ============================================================

CREATE TABLE `Transaction` (
    `transaction_id`    INT             NOT NULL AUTO_INCREMENT,
    `buyer_id`          INT             NOT NULL,
    `seller_id`         INT             NULL,
    `category_id`       INT             ,
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
    PRIMARY KEY (`transaction_id`,`category_id`),
    INDEX `idx_txn_buyer`     (`buyer_id`),
    INDEX `idx_txn_seller`    (`seller_id`),
    INDEX `idx_txn_item`      (`item_id`),
    INDEX `idx_txn_status`    (`status`),
    INDEX `idx_txn_timestamp` (`created_at`),
    CONSTRAINT `chk_txn_amount` CHECK (`amount` > 0)
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "Transaction"'
PARTITION BY HASH (`category_id`) (
    PARTITION `p1` COMMENT = 'srv "node1"',
    PARTITION `p2` COMMENT = 'srv "node2"',
    PARTITION `p3` COMMENT = 'srv "node3"'
);
CREATE TABLE `CartItem` (
    `cart_item_id`  INT         NOT NULL AUTO_INCREMENT,
    `cart_id`       INT         NOT NULL,
    `item_id`       INT         NOT NULL,
    `quantity`      INT         NOT NULL DEFAULT 1,
    -- FIX: Included cart_id in the Primary Key
    PRIMARY KEY (`cart_item_id`, `cart_id`), 
    INDEX `idx_cartitem_cart` (`cart_id`),
    INDEX `idx_cartitem_item` (`item_id`)
) ENGINE = SPIDER COMMENT = 'wrapper "mysql", table "CartItem"'
PARTITION BY HASH (`cart_id`) (
    PARTITION `p1` COMMENT = 'srv "node1"',
    PARTITION `p2` COMMENT = 'srv "node2"',
    PARTITION `p3` COMMENT = 'srv "node3"'
);


