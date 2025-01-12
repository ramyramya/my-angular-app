import { Component, OnInit } from '@angular/core';
import { DashboardService } from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  products: any[] = [];
  vendorCount: number = 0;

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.getVendorCount();
    this.getProducts();
  }

  getVendorCount(): void {
    this.dashboardService.getVendorCount().subscribe({
      next :(count) => {
        console.log("Count: ",count.count);
        this.vendorCount = count.count;
      },
      error: (error) => {
        console.error('Error fetching vendor count:', error);
      }}
    );
  }

  getProducts(): void {
    this.dashboardService.getProducts().subscribe({
      next: (products) => {
        console.log("Products: ", products);
        this.products = products.products;
      },
      error: (error) => {
        console.error('Error fetching products:', error);
      }}
    );
  }
}

