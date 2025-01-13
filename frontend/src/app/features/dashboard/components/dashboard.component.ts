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

  constructor(
    private dashboardService: DashboardService,
    private fb: FormBuilder // Form builder service for reactive forms
  ) {
    this.addProductForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      vendor: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
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
  /*onFileSelect(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  // Add a new product
  addProduct(): void {
    if (this.addProductForm.invalid) {
      return;
    }

    const formData = new FormData();
    formData.append('productName', this.addProductForm.value.productName);
    formData.append('category', this.addProductForm.value.category);
    formData.append('vendor', this.addProductForm.value.vendor);
    formData.append('quantity', this.addProductForm.value.quantity);
    formData.append('unit', this.addProductForm.value.unit);
    formData.append('status', 'Available'); // Default status
    if (this.selectedFile) {
      formData.append('productImage', this.selectedFile);
    }

    this.dashboardService.addProduct(formData).subscribe({
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

  // Download product data as a PDF when the download icon is clicked
  downloadProductAsPDF(product: Product): void {
    console.log("called");
    this.dashboardService.downloadProductAsPDF(product);
  }
}

