/*import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Product } from '../interfaces/product.interface';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  vendorCount: number = 0;

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5; // Items per page
  totalItems: number = 0;
  pages: number[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.getVendorCount();
    this.fetchPage(this.currentPage);
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

  // Download product data as a PDF when the download icon is clicked
  downloadProductAsPDF(product: Product) {
    console.log("called");
    this.dashboardService.downloadProductAsPDF(product);
  
  }
}*/

import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';
import { Product } from '../interfaces/product.interface';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as bootstrap from 'bootstrap'
import imageCompression from 'browser-image-compression';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: Product[] = [];
  vendorCount: number = 0;

  currentPage: number = 1;
  totalPages: number = 1;
  pageSize: number = 5; // Items per page
  totalItems: number = 0;
  pages: number[] = [];

  addProductForm: FormGroup; // Form group for the Add Product modal
  categories: any[] = []; // Categories for the dropdown
  vendors: any[] = []; // Vendors for the dropdown
  selectedFile: File | null = null; // Selected product image file
  fileUrl: string = '';

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
    this.getVendorCount();
    this.fetchPage(this.currentPage);
    this.loadCategories();
    this.loadVendors();
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
}

