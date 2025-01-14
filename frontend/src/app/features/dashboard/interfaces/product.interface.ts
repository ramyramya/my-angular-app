export interface Vendor {
    vendor_id: number;
    vendor_name: string;
  }
  
  export interface Product {
    product_id: number; // Added product_id
    category_id: number; // Added category_id
    category_name: string;
    category_status: number;
    product_image: string;
    product_name: string;
    product_status: number;
    quantity_in_stock: number;
    unit: string;
    unit_price: number;
    vendors: Vendor[]; // Updated from vendor_names (array of strings) to a detailed array of Vendor objects
    currentQuantity:number;
    isSelected: boolean;
    selectedVendorId : number|null;
  }
  