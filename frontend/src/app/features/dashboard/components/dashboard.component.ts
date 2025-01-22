import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Product } from '../interfaces/product.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap'
import imageCompression from 'browser-image-compression';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';



@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  // Define the transparent colors for badges (violet, pink, yellow)
  badgeColors = [
    'bg-transparent-purple',  // Transparent Violet
    'bg-transparent-pink',    // Transparent Pink
    'bg-transparent-yellow'   // Transparent Yellow
  ];
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
  selectedProductForEdit: Product | null = null;
  editSelectedFile: File | null = null; // File selected for editing
  fileUrlForEdit: string = ''; // Uploaded file URL for editing

  fileData: any[] = [];
  searchTerm: string = ''; // Search term
  filteredProducts: Product[] = []; // Filtered products list
  // Flags for the filter options
  isFilterDropdownVisible = false;
  filterByProductName = true;
  filterByStatus = false;
  filterByCategory = false;
  filterByVendor = false;
  selectedFileForUpload: File | null = null;

  files: { key: string; url: string; type: string }[] = [];
  selectedFiles: Set<string> = new Set();
  previewedFile: { key: string; url: string; type: string } | null = null;

  safeUrl : SafeResourceUrl | null = null;  

  selectedFileName: string = '';

  constructor(
    private dashboardService: DashboardService, private toastr: ToastrService,
    private fb: FormBuilder, // Form builder service for reactive forms
    private sanitizer: DomSanitizer
  ) {
    this.addProductForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      //vendor: ['', Validators.required],
      vendors: [[], Validators.required], // Change to an array for multiple selections
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
    this.getUserFiles();
  }

  ngDoCheck(): void {
    console.log("ngDoCheck Called");
    if (!this.showCart && this.flag == 1) {
      this.applyQuantityChanges(); // Call this when the cart is closed
      this.flag = 0;
    }
  }


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

  // fetchPage(page: number): void {
  //   if (page < 1 || (this.totalPages && page > this.totalPages)) return;

  //   this.dashboardService.getProducts(page, this.pageSize).subscribe({
  //     next: (data) => {
  //       console.log(data);
  //       this.products = data.products;
  //       this.totalItems = data.total;
  //       this.currentPage = data.page;
  //       this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  //       this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  //       console.log(this.pages);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching products:', error);
  //     },
  //   });


  // }

  // fetchPage(page: number): void {
  //   if (page < 1 || (this.totalPages && page > this.totalPages)) return;

  //   this.dashboardService.getProducts(page, this.pageSize).subscribe({
  //     next: (data) => {
  //       console.log("Products Fetched: ", data.products);
  //       this.products = data.products;
  //       this.totalItems = data.total;
  //       this.currentPage = data.page;
  //       this.totalPages = Math.ceil(this.totalItems / this.pageSize);
  //       this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);

  //       // Initialize filtered products
  //       this.applyFilters();
  //     },
  //     error: (error) => {
  //       console.error('Error fetching products:', error);
  //     },
  //   });
  // }


  fetchPage(page: number): void {
    if (page < 1 || (this.totalPages && page > this.totalPages)) return;

    const params = {
      page: page.toString(),
      limit: this.pageSize.toString(),
      searchTerm: this.searchTerm || '',
      filterByProductName: this.filterByProductName,
      filterByStatus: this.filterByStatus,
      filterByCategory: this.filterByCategory,
      filterByVendor: this.filterByVendor
    };

    this.dashboardService.getProducts(params).subscribe({
      next: (data) => {
        this.products = data.products;
        this.totalItems = data.total;
        this.currentPage = data.page;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.pages = Array.from({ length: this.totalPages }, (_, i) => i + 1);
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }
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
        console.log("cartProducts: ", this.cartProducts);
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

  async addProduct(): Promise<void> {
    console.log("Add Product Called");
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
        productImage: this.fileUrl || '' 
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
          this.closeModal("addProductModal");
          this.fetchPage(this.currentPage);
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
            'Content-Type': fileType, 
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
        this.closeModal("moveToModal");
        this.toastr.success('Products moved successfully!', 'Success');
        // Optionally refresh products or update UI
        this.fetchPage(this.currentPage);
        this.fetchCartPage(this.currentCartPage);
      },
      (error) => {
        console.error('Error moving products to cart:', error);
        this.toastr.error('Failed to move products.', 'Error');
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
          this.fetchPage(this.currentPage);
          this.quantityChanges = {}; // Clear the changes after a successful update
        },
        error: (error) => {
          console.error('Error updating cart items:', error);
        }
      });
    }
  }

  clearSelectedProducts() {
    this.selectedProducts = [];
  }

  onDeleteProduct(product: any) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.dashboardService.deleteProduct(product.product_id)
        .subscribe({
          next: (response) => {
            // Handle success response (e.g., refresh the product list)
            this.products = this.products.filter(p => p.product_id !== product.product_id);
            this.toastr.success("Product Deleted", "Success");

            this.fetchPage(this.currentPage);
          },
          error: (error) => {
            console.error('Error deleting product:', error);
            this.toastr.error("Error deleting Product", "error");
          }
        }
        );
    }
  }

  openEditProduct(product: Product): void {
    this.selectedProductForEdit = { ...product }; // Create a copy to avoid mutating the original
    this.selectedProductForEdit.selectedVendorIds = [];;
    console.log("Initial product: ", product);
  }

  onEditFileSelect(event: any): void {
    this.editSelectedFile = event.target.files[0];
  }

  async saveEditedProduct(): Promise<void> {
    if (!this.selectedProductForEdit) {
      return;
    }

    try {
      if (this.editSelectedFile) {
        // Upload the image before updating the product
        await this.uploadEditedProductImage();
      }

      const updatedProductData = {
        ...this.selectedProductForEdit,
        productImage: this.fileUrlForEdit || this.selectedProductForEdit.product_image // Use uploaded URL or existing image
      };

      this.submitUpdatedProduct(updatedProductData);
    } catch (error) {
      console.error('Error saving edited product:', error);
      this.toastr.error('Error saving product!', 'Error');
    }
  }

  private submitUpdatedProduct(updatedProductData: any): void {
    console.log("Submitted Product is: ", updatedProductData);
    this.dashboardService.updateProduct(updatedProductData).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success('Product updated Successfully!', 'Success');
          this.fetchPage(this.currentPage); // Reload the product list
          this.selectedProductForEdit = null; // Reset editing state
        }
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.toastr.error('Error updating product!', 'Error');
      }
    });
  }


  async uploadEditedProductImage(): Promise<void> {
    if (!this.editSelectedFile) {
      console.error('No file selected for upload');
      throw new Error('No file selected for upload');
    }

    const fileName = this.editSelectedFile.name;
    const fileType = this.editSelectedFile.type;

    try {
      // Compress the selected image
      const compressedFile = await this.compressImage(this.editSelectedFile);
      console.log('Compressed file:', compressedFile);

      // Get presigned URL from backend
      const response: any = await this.dashboardService.getPresignedUrl(fileName, fileType).toPromise();

      if (response.success) {
        const presignedUrl = response.presignedUrl;
        this.fileUrlForEdit = response.fileUrl; // Set file URL after successful response

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

        console.log('File uploaded successfully:', this.fileUrlForEdit);
      } else {
        console.error('Error retrieving presigned URL');
        throw new Error('Error retrieving presigned URL');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      throw error;
    }
  }

  cancelEdit(): void {
    this.selectedProductForEdit = null;
    this.editSelectedFile = null;
  }

  deleteCartItem(cartId: number): void {
    console.log("cartId: ", cartId);
    this.dashboardService.deleteCartItem(cartId).subscribe({
      next: (res) => {
        this.toastr.success("Product Deleted", "Success");;
        // Refresh the cart after deletion
        this.fetchCartPage(this.currentCartPage);
        this.fetchPage(this.currentPage);
      },
      error: (err) => {
        this.toastr.error("Error Deleting Product ", "Error");
      }
    });
  }


  onFileChange(event: any): void {
    const target: DataTransfer = <DataTransfer>(event.target);
    if (target.files.length !== 1) {
      console.error('Cannot use multiple files');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer: ArrayBuffer = e.target!.result as ArrayBuffer;
      const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName: string = workbook.SheetNames[0];
      const sheetData: XLSX.WorkSheet = workbook.Sheets[sheetName];
      this.fileData = XLSX.utils.sheet_to_json(sheetData);
      this.selectedFileName = target.files[0].name;
      console.log('Parsed Data:', this.fileData);
    };
    reader.readAsArrayBuffer(target.files[0]);
  }

  // Handle drag over event to allow file drop
  onImportFileDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle file drop
  onImportFileDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length === 1) {
      this.handleFile(files[0]);
    }
  }

  // Handle drag leave event to reset styles
  onImportFileDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle the dropped file
  private handleFile(file: File): void {
    this.selectedFileName = file.name;
    const reader: FileReader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const arrayBuffer: ArrayBuffer = e.target!.result as ArrayBuffer;
      const workbook: XLSX.WorkBook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName: string = workbook.SheetNames[0];
      const sheetData: XLSX.WorkSheet = workbook.Sheets[sheetName];
      this.fileData = XLSX.utils.sheet_to_json(sheetData);
      console.log('Parsed Data:', this.fileData);
    };
    reader.readAsArrayBuffer(file);
  }

  // Upload data to backend
  uploadData(): void {
    if (this.fileData.length > 0) {
      this.dashboardService.updateProductData(this.fileData).subscribe({
        next: (res) => {
          console.log('Data updated successfully!', res);
          this.closeModal("importModal");
          this.selectedFileName = '';
          this.toastr.success("Data Uploaded Successfully", "Success");
        },
        error: (err) => {
          console.error('Error updating data!', err);
          this.toastr.error("Error Uploading Data", "Error");
        },
      });
    } else {
      alert('Please upload a valid file!');
    }
  }

  closeModal(modalname: string): void {
    const modalElement = document.getElementById(modalname);
    if (modalElement) {
      const modal = bootstrap.Modal.getInstance(modalElement)!;
      modal.hide();
      modal.dispose();
    }
  }


  // Toggle filter dropdown visibility
  toggleFilterDropdown(): void {
    this.isFilterDropdownVisible = !this.isFilterDropdownVisible;
  }

  // // Apply filters based on selected options
  // applyFilters(): void {

  //   // If no filter checkboxes are selected, return all products
  //   if (!this.filterByProductName && !this.filterByStatus && !this.filterByCategory && !this.filterByVendor) {
  //     this.filteredProducts = [...this.products];
  //     return;
  //   }

  //   this.filteredProducts = this.products.filter(product => {
  //     // Product Name filter (if selected)
  //     const matchesProductName = this.filterByProductName && product.product_name.toLowerCase().includes(this.searchTerm.toLowerCase());

  //     // Status filter (if selected)
  //     const matchesStatus = this.filterByStatus && (product.quantity_in_stock > 0 ? 'Available' : 'Sold Out').toLowerCase().includes(this.searchTerm.toLowerCase());

  //     // Category filter (if selected)
  //     const matchesCategory = this.filterByCategory && product.category_name.toLowerCase().includes(this.searchTerm.toLowerCase());

  //     // Vendor filter (if selected)
  //     const matchesVendor = this.filterByVendor && product.vendors.some(vendor => vendor.vendor_name.toLowerCase().includes(this.searchTerm.toLowerCase()));

  //     // If any of the selected filters match, include the product in the filtered list
  //     const matchesSelectedFilters = (this.filterByProductName && matchesProductName) ||
  //       (this.filterByStatus && matchesStatus) ||
  //       (this.filterByCategory && matchesCategory) ||
  //       (this.filterByVendor && matchesVendor);

  //     return matchesSelectedFilters;
  //   });
  // }

  applyFilters(): void {
    this.fetchPage(1);
  }
  // Function to get a color class based on index
  getBadgeClass(index: number): string {
    return this.badgeColors[index % this.badgeColors.length]; // Ensures colors repeat
  }

  onFileUploadSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFileForUpload = input.files[0];
      
    }
  }

  // Handle drag over event to allow file drop
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Handle file drop
  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.selectedFileForUpload = files[0];
    }
  }

  // Handle drag leave event to reset styles
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  // Upload the file
  uploadFile(): void {
    if (!this.selectedFileForUpload) {
      alert('No file selected!');
      return;
    }

    const file = this.selectedFileForUpload;
    const fileName = file.name;
    const fileType = file.type;

    // Step 1: Request the presigned URL
    this.dashboardService.getPresignedUrlForFile(fileName, fileType).subscribe({
      next: (response) => {
        const { presignedUrl, fileUrl } = response;
        console.log("FilePath: ",  fileUrl);

        // Step 2: Upload the file to S3 using the presigned URL
        fetch(presignedUrl, {
          method: 'PUT',
          headers: { 'Content-Type': fileType },
          body: file,
        })
          .then(() => {
            alert('File uploaded successfully!');
            this.selectedFileForUpload = null;
            this.getUserFiles();
          })
          .catch((err) => {
            console.error('Error uploading file:', err);
            alert('Failed to upload file.');
          });
      },
      error: (err) => {
        console.error('Error getting presigned URL:', err);
        alert('Failed to get presigned URL.');
      },
    });
  }
  getUserFiles(){
    // Fetch user files on component initialization
    this.dashboardService.getUserFiles().subscribe({
      next: (response) => {
        this.files = response.files;
        console.log("Files: ", this.files);
      },
      error: (err) => {
        console.error('Error fetching files:', err);
      },
    });
  }
  
  toggleFileSelection(fileKey: string): void {
    if (this.selectedFiles.has(fileKey)) {
      this.selectedFiles.delete(fileKey);
    } else {
      this.selectedFiles.add(fileKey);
    }
  }

  async downloadSelectedFiles(): Promise<void> {
    if (this.selectedFiles.size === 0) {
      alert('Please select at least one file to download.');
      return;
    }

    if (this.selectedFiles.size === 1) {
      // Single file download
      const fileKey = Array.from(this.selectedFiles)[0];
      const file = this.files.find((f) => f.key === fileKey);
      if (file) {
        const response = await fetch(file.url);
        const blob = await response.blob();
        saveAs(blob, fileKey.split('/').pop() || 'downloaded-file');
      }
    } else {
      // Multiple files - Create a ZIP archive
      const zip = new JSZip();
      const downloadPromises = Array.from(this.selectedFiles).map(async (fileKey) => {
        const file = this.files.find((f) => f.key === fileKey);
        if (file) {
          const response = await fetch(file.url);
          const blob = await response.blob();
          zip.file(fileKey.split('/').pop() || 'file', blob);
        }
      });

      await Promise.all(downloadPromises);

      // Generate and save the ZIP file
      zip.generateAsync({ type: 'blob' }).then((content) => {
        saveAs(content, 'selected_files.zip');
      });
    }
  }

  previewFile(file: { key: string; url: string; type: string }) {
    // Set the previewed file for reference
    this.previewedFile = file;
  
    // Safely sanitize the file's URL and store it in a separate property
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(file.url);
  
    // Get the modal element
  const previewModalElement = document.getElementById('filePreviewModal') as HTMLElement;

  // Initialize the modal
  const previewModal = new bootstrap.Modal(previewModalElement);

  // Add an event listener for when the modal is hidden
  previewModalElement.addEventListener('hidden.bs.modal', () => {
    this.previewedFile = null;
    this.safeUrl = null;
  });

  // Show the modal
  previewModal.show();
  }
  
}

