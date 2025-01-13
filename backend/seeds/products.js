/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = function (knex) {
  return knex('products')
    .del()
    .then(function () {
      return knex('products').insert([
        { product_name: 'Smartphone', category_id: 7, quantity_in_stock: 50, unit_price: 499.99, product_image: 'smartphone.jpg', status: 1, unit: 'piece' },
        { product_name: 'Jeans', category_id: 8, quantity_in_stock: 200, unit_price: 39.99, product_image: 'jeans.jpg', status: 1, unit: 'pair' },
        { product_name: 'Table', category_id: 9, quantity_in_stock: 30, unit_price: 89.99, product_image: 'table.jpg', status: 1, unit: 'piece' },
        { product_name: 'Laptop', category_id: 7, quantity_in_stock: 40, unit_price: 899.99, product_image: 'laptop.jpg', status: 1, unit: 'piece' },
        { product_name: 'T-shirt', category_id: 8, quantity_in_stock: 150, unit_price: 19.99, product_image: 'tshirt.jpg', status: 1, unit: 'piece' },
        { product_name: 'Gaming Console', category_id: 26, quantity_in_stock: 60, unit_price: 399.99, product_image: 'console.jpg', status: 1, unit: 'piece' },
        { product_name: 'Garden Shovel', category_id: 19, quantity_in_stock: 100, unit_price: 15.99, product_image: 'shovel.jpg', status: 1, unit: 'piece' },
        { product_name: 'Guitar', category_id: 14, quantity_in_stock: 25, unit_price: 19.99, product_image: 'guitar.jpg', status: 1, unit: 'piece' },
        { product_name: 'Chair', category_id: 9, quantity_in_stock: 80, unit_price: 29.99, product_image: 'chair.jpg', status: 1, unit: 'piece' },
        { product_name: 'Headphones', category_id: 7, quantity_in_stock: 120, unit_price: 49.99, product_image: 'headphones.jpg', status: 1, unit: 'piece' },
        { product_name: 'Cookware Set', category_id: 19, quantity_in_stock: 70, unit_price: 89.99, product_image: 'cookware.jpg', status: 1, unit: 'set' },
        { product_name: 'Running Shoes', category_id: 22, quantity_in_stock: 95, unit_price: 75.99, product_image: 'shoes.jpg', status: 1, unit: 'pair' },
        { product_name: 'Desk Lamp', category_id: 9, quantity_in_stock: 40, unit_price: 24.99, product_image: 'lamp.jpg', status: 1, unit: 'piece' },
        { product_name: 'Backpack', category_id: 20, quantity_in_stock: 50, unit_price: 34.99, product_image: 'backpack.jpg', status: 1, unit: 'piece' },
        { product_name: 'Yoga Mat', category_id: 19, quantity_in_stock: 60, unit_price: 29.99, product_image: 'yogamat.jpg', status: 1, unit: 'piece' },
        { product_name: 'Coffee Maker', category_id: 21, quantity_in_stock: 25, unit_price: 99.99, product_image: 'coffeemaker.jpg', status: 1, unit: 'piece' },
        { product_name: 'Book Shelf', category_id: 9, quantity_in_stock: 15, unit_price: 149.99, product_image: 'bookshelf.jpg', status: 1, unit: 'piece' },
        { product_name: 'Tablet', category_id: 7, quantity_in_stock: 35, unit_price: 299.99, product_image: 'tablet.jpg', status: 1, unit: 'piece' },
        { product_name: 'Sunglasses', category_id: 20, quantity_in_stock: 75, unit_price: 19.99, product_image: 'sunglasses.jpg', status: 1, unit: 'piece' },
        { product_name: 'Office Chair', category_id: 9, quantity_in_stock: 20, unit_price: 199.99, product_image: 'officechair.jpg', status: 1, unit: 'piece' },
      ]);
    });
};

