const fs = require('fs');
const path = require('path');
const ExcelJS = require('exceljs');
const { faker } = require('@faker-js/faker');

const VALID_CATEGORIES = [
  'Electronics', 'Clothing', 'Furniture', 'Books', 'Toys', 'Sports', 'Beauty',
  'Automotive', 'Jewelry', 'Music', 'Health', 'Home Decor', 'Gardening',
  'Stationery', 'Groceries', 'Footwear', 'Pet Supplies', 'Appliances', 'Gaming', 'Hardware'
];

const VALID_VENDORS = [
  'TechStore', 'FashionHub', 'HomeDecor', 'GardenWorld', 'ApplianceMart',
  'GadgetGuru', 'OutdoorGear', 'MusicCenter', 'WellnessShop', 'PetCarePlus'
];

const STATUS_OPTIONS = ['Available', 'Out of Stock'];
const TOTAL_ROWS = 20000;

async function generateAllValidExcel() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Products');

  worksheet.columns = [
    { header: 'Product Name', key: 'productName', width: 25 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Vendor', key: 'vendor', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 10 },
    { header: 'Unit Price', key: 'unitPrice', width: 10 },
  ];

  console.log(`Generating ${TOTAL_ROWS} valid rows...`);
  for (let i = 0; i < TOTAL_ROWS; i++) {
    worksheet.addRow({
      productName: faker.commerce.productName(),
      status: faker.helpers.arrayElement(STATUS_OPTIONS),
      category: faker.helpers.arrayElement(VALID_CATEGORIES),
      vendor: faker.helpers.arrayElement(VALID_VENDORS),
      quantity: faker.number.int({ min: 1, max: 100 }),
      unitPrice: faker.number.float({ min: 1.0, max: 500.0, multipleOf: 0.01 }),
    });
  }

  const filePath = path.join(__dirname, 'all_valid_products.xlsx');
  await workbook.xlsx.writeFile(filePath);
  console.log(`✅ Excel file with all valid rows generated successfully: ${filePath}`);
}

// Run the script
generateAllValidExcel().catch(console.error);
