import { Component, OnInit } from '@angular/core';
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
}
