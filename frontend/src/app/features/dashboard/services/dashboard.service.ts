import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../interfaces/product.interface';
import { jsPDF } from 'jspdf';


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getUserData(): Observable<{ userId: number, username: string; thumbnail: string; email: string }> {
    return this.http.get<{ userId: number, username: string; thumbnail: string; email: string }>(`${this.apiUrl}/user-info`);
  }

  getPresignedUrl(fileName: string, fileType: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get-presigned-url`, { fileName, fileType });
  }


  updateProfilePic(fileUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-profile-pic`, { fileUrl });
  }

   // Fetch vendor count
   getVendorCount(): Observable<{success:string, count:number}> {
    return this.http.get<{success:string, count:number}>(`${this.apiUrl}/vendorCount`);
  }


  getProducts(page: number, limit: number): Observable<{ success: string; products: Product[]; total: number; page: number; limit: number }> {
    return this.http.get<{ success: string; products: Product[]; total: number; page: number; limit: number }>(
      `${this.apiUrl}/products?page=${page}&limit=${limit}`
    );
  }


  downloadProductAsPDF(product: Product){
    const doc = new jsPDF();
        // Add product image (Make sure `product.image_url` is the correct URL or base64 string)
        const imageUrl = "https://akv-interns.s3.ap-south-1.amazonaws.com/profile-photos/kurkure.jpg";
        console.log(imageUrl);  // Example: product.product_image_url (URL of the image)
  
        // Add the image to the PDF (adjust the parameters as needed)
        doc.addImage(imageUrl, 'JPEG', 140, 30, 50, 50);  // x, y, width, height
        // Add title to the PDF
        doc.setFontSize(18);
        doc.text('Product Details', 14, 22);
        
        /// Add product details
doc.setFontSize(12);
doc.text(`Product Name: ${product.product_name}`, 14, 30);
doc.text(`Category: ${product.category_name}`, 14, 36);

// Map vendor names from the vendors array and join them
const vendorNames = product.vendors.map(vendor => vendor.vendor_name).join(', ');
doc.text(`Vendors: ${vendorNames}`, 14, 42);

doc.text(`Quantity in Stock: ${product.quantity_in_stock}`, 14, 48);
doc.text(`Unit: ${product.unit}`, 14, 54);
doc.text(`Status: ${product.product_status === 1 ? 'Available' : 'Sold Out'}`, 14, 60);

        
        // Save the PDF file
        doc.save(`${product.product_name}_details.pdf`);
  }

  getCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/categories`);
  }
  
  getVendors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/vendors`);
  }
  
  addProduct(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-product`, productData);
  }


  moveToCart(products: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/move-to-cart`, { products });
  }

  // Fetch cart items for the logged-in user
  getCartItems(page: number, limit: number): Observable<{ success: string; products: Product[]; total: number; page: number; limit: number }> {
    return this.http.get<{ success: string; products: Product[]; total: number; page: number; limit: number }>(`${this.apiUrl}/cart?page=${page}&limit=${limit}`);
  }


  // Method to update the cart item quantity and product stock
  updateCartItemQuantity(product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cart/update`, product);
  }
}

  

