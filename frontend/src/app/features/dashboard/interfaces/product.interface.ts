export interface Product {
    category_name: string;
    category_status: number;
    product_image: string;
    product_name: string;
    product_status: number;
    quantity_in_stock: number;
    unit: string;
    unit_price: number;
    vendor_names: string[]; // Changed from single string to an array of strings
    vendor_status: number;
  }
  