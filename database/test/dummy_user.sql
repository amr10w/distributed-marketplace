USE `marketplace_db`;

-- Create a User (The Seller)
INSERT INTO User (username, email, password_hash) 
VALUES ('amr_seller', 'amr@example.com', 'hashed_pass_123');

-- Create a Store for that User
-- (Since the DB was truncated, this will be store_id = 1)
INSERT INTO Store (owner_id, store_name, description) 
VALUES (1, 'Distributed Tech Store', 'Selling gadgets across nodes');

-- Create a few Categories
INSERT INTO Category (name) VALUES ('Electronics'), ('Home'), ('Fashion');


-- This item (Category 1) should land on Node 2
INSERT INTO Item (store_id, category_id, name, price, stock_quantity) 
VALUES (1, 1, 'High-End Laptop', 2500.00, 5);

-- This item (Category 2) should land on Node 3
INSERT INTO Item (store_id, category_id, name, price, stock_quantity) 
VALUES (1, 2, 'Smart Coffee Maker', 120.00, 15);

-- This item (Category 3) should land on Node 1
INSERT INTO Item (store_id, category_id, name, price, stock_quantity) 
VALUES (1, 3, 'Designer T-Shirt', 45.00, 50);

EXPLAIN PARTITIONS SELECT * FROM Item;

-- 1. Create a Cart for our user (amr_seller)
INSERT INTO Cart (user_id, status) VALUES (1, 'active');

-- 2. Add the Laptop (item_id 1) to the Cart (cart_id 1)
-- This row will be routed to a node based on HASH(cart_id)
INSERT INTO CartItem (cart_id, item_id, quantity) VALUES (1, 1, 1);

-- 3. Add the T-Shirt (item_id 3) to the same Cart
INSERT INTO CartItem (cart_id, item_id, quantity) VALUES (1, 3, 2);


SELECT 
    u.username,
    c.cart_id,
    c.status AS cart_status,
    i.name AS item_name,
    i.price AS unit_price,
    ci.quantity,
    (i.price * ci.quantity) AS subtotal
FROM User u
JOIN Cart c ON u.user_id = c.user_id
JOIN CartItem ci ON c.cart_id = ci.cart_id
JOIN Item i ON ci.item_id = i.item_id
WHERE u.user_id = 1;

UPDATE Wallet SET balance = 1000.00 WHERE user_id = 1;