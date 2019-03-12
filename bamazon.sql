DROP DATABASE IF EXISTS bamazon_db;
CREATE DATABASE bamazon_db;
USE bamazon_db;

CREATE TABLE products (
    item_id INT AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    department_name VARCHAR(100) NOT NULL,
    price INT NOT NULL,
    stock_quantity INT NOT NULL,
    PRIMARY KEY (item_id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity) 
VALUES 
('Laptop Computer', 'Electronics', 2000, 3),
('iPhone', 'Electronics', 700, 1),
('Apple Watch', 'Electronics', 300, 50),
('VR System', 'Gaming', 200, 100),
('Pens', 'Office Supplies', 5, 200),
('Plasma TV', 'Household', 600, 5),
('Big Sofa', 'Household', 150, 15),
('Hoodie', 'Clothing', 50, 20),
('Shoes', 'Clothing', 40, 45),
('Puppies', 'Pets', 50, 450);

CREATE TABLE orders (
  order_id INT AUTO_INCREMENT NOT NULL,
  item_id INT NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL,
  total_price INT NOT NULL,
  remaining_stock INT NOT NULL,
  PRIMARY KEY (order_id)
);

CREATE TABLE inventory (
  log_id INT(11) AUTO_INCREMENT NOT NULL,
  item_id INT(11) NOT NULL,
  product_name VARCHAR(100) NOT NULL,
  current_stock INT(11) NOT NULL,
  quantity_added INT(11) NOT NULL,
  updated_stock INT(11) NOT NULL,
  PRIMARY KEY (log_id)
);