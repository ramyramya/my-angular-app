import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Product } from '../interfaces/product.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap'
import imageCompression from 'browser-image-compression';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  showCart: boolean = false;  // Flag to control which table is shown
  products: Product[] = [];
  vendorCount: number = 0;

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5; // Items per page
  totalItems: number = 0;
  pages: number[] = [];

  currentCartPage: number = 1;
  totalCartPages: number = 1;
  cartPageSize: number = 5; // Items per page
  totalCartItems: number = 0;
  cartPages: number[] = [];

  userId !: number;
  addProductForm: FormGroup; // Form group for the Add Product modal
  categories: any[] = []; // Categories for the dropdown
  vendors: any[] = []; // Vendors for the dropdown
  selectedFile: File | null = null; // Selected product image file
  fileUrl: string = '';
  selectedProducts: Product[] = [];
  cartProducts: any[] = [];
  // Track changes using the difference in quantity
  quantityChanges: { [key: number]: number } = {}; // Maps product_id to change in quantity
  flag = 1;

  constructor(
    private dashboardService: DashboardService, private toastr: ToastrService,
    private fb: FormBuilder // Form builder service for reactive forms
  ) {
    this.addProductForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      vendor: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      unit: ['', Validators.required],
      status: [1, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.dashboardService.getUserData().subscribe(data => {
      this.userId = data.userId;
    });
    this.getVendorCount();
    this.fetchPage(this.currentPage);
    this.loadCategories();
    this.loadVendors();
    this.fetchCartPage(this.currentCartPage);
  }

  ngDoCheck(): void {
    console.log("ngDoCheck Called");
    if (!this.showCart && this.flag == 1) {
      this.applyQuantityChanges(); // Call this when the cart is closed
      this.flag = 0;
    }
  }

  // // Fetch cart items from the server
  // fetchCartItems(): void {
  //   this.dashboardService.getCartItems().subscribe({
  //     next: (response) => {
  //       console.log("Cart Response:", response);
  //       this.cartProducts = response.cartItems;
  //     },
  //     error: (error) => {
  //       console.error('Error fetching cart items:', error);
  //     }
  //   }
  //   );
  // }

  toggleTable(view: string): void {
    if (view === 'cart') {
      this.showCart = true;
    } else {
      this.showCart = false;
      this.flag = 1;
    }
  }

  getVendorCount(): void {
    this.dashboardService.getVendorCount().subscribe({
      next: (count) => {
        this.vendorCount = count.count;
      },
      error: (error) => {
        console.error('Error fetching vendor count:', error);
      },
    });
  }

  fetchPage(page: number): void {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;

    this.dashboardService.getProducts(page, this.pageSize).subscribe({
      next: (data) => {
        console.log(data);
        this.products = data.products;
        this.totalItems = data.total;
        this.currentPage = data.page;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
        console.log(this.pages);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      },
    });


  }

  fetchCartPage(page: number): void {
    if (page < 1 || (this.totalCartPages && page > this.totalCartPages)) return;

    this.dashboardService.getCartItems(page, this.cartPageSize).subscribe({
      next: (data) => {
        console.log(data);
        this.cartProducts = data.products;
        this.totalCartItems = data.total;
        this.currentCartPage = data.page;
        this.totalCartPages = Math.ceil(this.totalCartItems / this.cartPageSize);
        this.cartPages = Array.from({ length: this.totalCartPages }, (_, i) => i + 1);
        console.log(this.cartPages);
      },
      error: (error) => {
        console.error('Error fetching cartProducts:', error);
      },
    });
  }

  // Load categories for the dropdown
  loadCategories(): void {
    this.dashboardService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories.categories;
        console.log(categories);
      },
      error: (error) => {
        console.error('Error fetching categories:', error);
      }
    });
  }

  // Load vendors for the dropdown
  loadVendors(): void {
    this.dashboardService.getVendors().subscribe({
      next: (vendors) => {
        this.vendors = vendors.vendors;
        console.log(vendors);
      },
      error: (error) => {
        console.error('Error fetching vendors:', error);
      }
    });
  }

  // Handle file selection for product image
  onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Add a new product
  /*addProduct(): void {
    if (this.addProductForm.invalid) {
      return;
    }

    
    if (this.selectedFile) {
      this.uploadProfilePhoto();
    }

    const productData = {
      ...this.addProductForm.value,
      productImage: this.fileUrl
    }

    this.dashboardService.addProduct(productData).subscribe({
      next: () => {
        // Close modal, reload product list
        const modalElement = document.getElementById('addProductModal') as HTMLElement;
        const modal = bootstrap.Modal.getInstance(modalElement);
        modal?.hide();

        // Reload the product list
        this.fetchPage(this.currentPage);
      },
      error: (error) => {
        console.error('Error adding product:', error);
      }
    });
  }*/

  /*addProduct(): void {
    if (this.addProductForm.invalid) {
      return;
    }
  
    // Only proceed with adding product if there's a selected file
    if (this.selectedFile) {
      // Wait for the upload to complete before proceeding
      this.uploadProfilePhoto().then(() => {
        // Check if the fileUrl is set (file uploaded successfully)
        if (this.fileUrl) {
          const productData = {
            ...this.addProductForm.value,
            productImage: this.fileUrl
          };
  
          this.dashboardService.addProduct(productData).subscribe({
            next: (data) => {
              if(data.success){
                this.toastr.success('Product added Successfully!', 'Success');
              }
            },
            error: (error) => {
              console.error('Error adding product:', error);
            }
          });
        } else {
          console.error('File upload failed. Cannot submit product data.');
        }
      }).catch(error => {
        console.error('Error uploading product image:', error);
      });
    } else {
      console.log("Else");
      // If no file is selected, proceed directly with the product data
      const productData = {
        ...this.addProductForm.value,
        productImage: this.fileUrl // Empty or default fileUrl if no file selected
      };
  
      this.dashboardService.addProduct(productData).subscribe({
        next: (data) => {
          if(data.success){
            this.toastr.success('Logged in successfully!', 'Success');
          }
          // Close modal, reload product list
          
        
        },
        error: (error) => {
          console.error('Error adding product:', error);
        }
      });
      
    }
  }*/

  async addProduct(): Promise<void> {
    if (this.addProductForm.invalid) {
      return;
    }

    try {
      if (this.selectedFile) {
        // Wait for the upload to complete before proceeding
        await this.uploadProfilePhoto();
      }

      // Proceed with product submission
      const productData = {
        ...this.addProductForm.value,
        productImage: this.fileUrl || '' // Use the uploaded file URL or a default value
      };

      this.submitProduct(productData);
    } catch (error) {
      console.error('Error adding product:', error);
    }
  }

  // Function to handle product submission
  private submitProduct(productData: any): void {
    this.dashboardService.addProduct(productData).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success('Product added Successfully!', 'Success');
          // Optional: Reset form, close modal, reload product list
        }
      },
      error: (error) => {
        this.toastr.error('Product added Successfully!', 'Error');
        console.error('Error adding product:', error);
      }
    });
  }

  async uploadProfilePhoto(): Promise<void> {
    if (!this.selectedFile) {
      console.error('No file selected for upload');
      throw new Error('No file selected for upload');
    }

    const fileName = this.selectedFile.name;
    const fileType = this.selectedFile.type;

    try {
      // Compress the selected image
      const compressedFile = await this.compressImage(this.selectedFile);
      console.log('Compressed file:', compressedFile);

      // Get presigned URL from backend
      const response: any = await this.dashboardService.getPresignedUrl(fileName, fileType).toPromise();

      if (response.success) {
        const presignedUrl = response.presignedUrl;
        this.fileUrl = response.fileUrl; // Set file URL after successful response

        // Upload the compressed file to S3
        const uploadResponse = await fetch(presignedUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileType, // Use the file's MIME type
          },
          body: compressedFile,
        });

        if (!uploadResponse.ok) {
          console.error('Error uploading file to S3:', uploadResponse.statusText);
          throw new Error('File upload failed');
        }

        console.log('File uploaded successfully:', this.fileUrl);
      } else {
        console.error('Error retrieving presigned URL');
        throw new Error('Error retrieving presigned URL');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  }


  async compressImage(file: File): Promise<File> {
    const options = {
      maxSizeMB: 1, // Limit the size to 1MB
      maxWidthOrHeight: 60, // Maximum width or height of the compressed image
      useWebWorker: true, // Use a web worker for the compression
    };

    try {
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.error('Error compressing file:', error);
      throw error;
    }
  }


  // Download product data as a PDF when the download icon is clicked
  downloadProductAsPDF(product: Product): void {
    console.log("called");
    this.dashboardService.downloadProductAsPDF(product);
  }

  // Method to handle the checkbox selection
  onCheckboxChange(event: any, product: any): void {
    if (event.target.checked) {
      this.selectedProducts.push(product);
    } else {
      const index = this.selectedProducts.indexOf(product);
      if (index > -1) {
        this.selectedProducts.splice(index, 1);
      }
    }
  }

  // Method to download selected products as an Excel file
  downloadAllSelected(): void {
    if (this.selectedProducts.length === 0) {
      alert('Please select at least one product to download.');
      return;
    }

    const worksheetData = this.selectedProducts.map(product => ({
      'Product Name': product.product_name,
      'Status': product.product_status === 1 ? 'Available' : 'Sold Out',
      'Category': product.category_name,
      'Vendors': product.vendors.map(vendor => vendor.vendor_name).join(', '), // Map vendor names from the vendors array
      'Quantity': product.quantity_in_stock,
      'Unit': product.unit
    }));


    // Create a worksheet from the data
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(worksheetData);

    // Create a workbook from the worksheet
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

    // Export the workbook to an Excel file
    XLSX.writeFile(wb, 'inventory.xlsx');
  }


  getVendorNames(vendors: { vendor_id: number; vendor_name: string }[]): string {
    return vendors.map(vendor => vendor.vendor_name).join(', ');
  }

  adjustQuantity(product: any, change: number): void {
    const newQuantity = product.currentQuantity + change;

    // Ensure quantity is within valid range (0 to quantity_in_stock)
    if (newQuantity >= 0 && newQuantity <= product.quantity_in_stock) {
      product.currentQuantity = newQuantity;
    }
  }


  moveSelectedProducts(): void {
    const selectedProducts = this.selectedProducts
      .filter(product => product.isSelected)
      .map(product => ({
        user_id: this.userId,
        product_id: product.product_id,
        vendor_id: product.selectedVendorId,
        quantity: product.currentQuantity,
      }));

    if (selectedProducts.length === 0) {
      alert('Please select at least one product to move.');
      return;
    }

    this.dashboardService.moveToCart(selectedProducts).subscribe(
      (response) => {
        console.log('Products moved to cart:', response);
        alert('Products moved successfully!');
        // Optionally refresh products or update UI
      },
      (error) => {
        console.error('Error moving products to cart:', error);
        alert('Failed to move products.');
      }
    );
  }

  updateQuantity(product: any, change: number): void {
    const newQuantity = product.quantity + change;
  
    // Only allow non-negative quantities
    if (newQuantity >= 0) {
      product.quantity = newQuantity; // Update the displayed quantity
  
      // Calculate the change in quantity from the initial state
      const initialQuantity = product.initialQuantity || product.quantity; // Fallback if initialQuantity is not defined
      this.quantityChanges[product.product_id] = newQuantity - initialQuantity;
    }
  }
  
  applyQuantityChanges(): void {
    // Prepare the payload for the backend with the changes
    const updatedProducts = Object.keys(this.quantityChanges)
      .filter((product_id) => this.quantityChanges[+product_id] !== 0) // Exclude unchanged quantities
      .map((product_id) => ({
        productId: +product_id,
        changeInQuantity: this.quantityChanges[+product_id],
      }));
  
    // Call the backend to update the quantities in batch
    if (updatedProducts.length > 0) {
      this.dashboardService.updateCartItemQuantity(updatedProducts).subscribe({
        next: (response) => {
          console.log('Cart items updated successfully:', response);
          this.fetchCartPage(this.currentCartPage); // Optionally re-fetch the cart
          this.quantityChanges = {}; // Clear the changes after a successful update
        },
        error: (error) => {
          console.error('Error updating cart items:', error);
        }
      });
    }
  }

  clearSelectedProducts(){
    this.selectedProducts = [];
  }
}

