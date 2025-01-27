import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../interfaces/product.interface';
import { jsPDF } from 'jspdf';
import { io } from "socket.io-client";


@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;
  // private apiSocketUrl = "http://localhost:3000";
  // private socket = io(this.apiSocketUrl);

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


  // getProducts(page: number, limit: number): Observable<{ success: string; products: Product[]; total: number; page: number; limit: number }> {
  //   return this.http.get<{ success: string; products: Product[]; total: number; page: number; limit: number }>(
  //     `${this.apiUrl}/products?page=${page}&limit=${limit}`
  //   );
  // }

  getProducts(params: any): Observable<any> {
    console.log("Params: ", params);
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('limit', params.limit)
      .set('searchTerm', params.searchTerm);

    if (params.filterByProductName) {
      httpParams = httpParams.set('filterByProductName', 'true');
    }
    if (params.filterByStatus) {
      httpParams = httpParams.set('filterByStatus', 'true');
    }
    if (params.filterByCategory) {
      httpParams = httpParams.set('filterByCategory', 'true');
    }
    if (params.filterByVendor) {
      httpParams = httpParams.set('filterByVendor', 'true');
    }

    return this.http.get(`${this.apiUrl}/products`, { params: httpParams });
  }

  downloadProductAsPDF(product: Product){
    const doc = new jsPDF();
        // Add product image (Make sure `product.image_url` is the correct URL or base64 string)
        const imageUrl = product.product_image;
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

  // // Fetch cart items for the logged-in user
  // getCartItems(page: number, limit: number): Observable<{ success: string; products: Product[]; total: number; page: number; limit: number }> {
  //   return this.http.get<{ success: string; products: Product[]; total: number; page: number; limit: number }>(`${this.apiUrl}/cart?page=${page}&limit=${limit}`);
  // }

  getCartItems(params: any): Observable<{ success: string; products: Product[]; total: number; page: number; limit: number }> {
    console.log("Params: ", params);
  
    let httpParams = new HttpParams()
      .set('page', params.page)
      .set('limit', params.limit);
  
    // Add the filters if they are provided
    if (params.searchTerm) {
      httpParams = httpParams.set('searchTerm', params.searchTerm);
    }
    if (params.filterByProductName) {
      httpParams = httpParams.set('filterByProductName', 'true');
    }
    if (params.filterByStatus) {
      httpParams = httpParams.set('filterByStatus', 'true');
    }
    if (params.filterByCategory) {
      httpParams = httpParams.set('filterByCategory', 'true');
    }
    if (params.filterByVendor) {
      httpParams = httpParams.set('filterByVendor', 'true');
    }
  
    // Send GET request with the parameters and filters
    return this.http.get<{ success: string; products: Product[]; total: number; page: number; limit: number }>(`${this.apiUrl}/cart`, { params: httpParams });
  }
  


  // Method to update the cart item quantity and product stock
  updateCartItemQuantity(product: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/cart/update`, product);
  }


  deleteProduct(productId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/delete_product/${productId}`,{});
  }

  updateProduct(productData: any): Observable<any> {
    const url = `${this.apiUrl}/products/${productData.product_id}`;
    return this.http.put(url, productData);
  }


  deleteCartItem(cartId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete-cart-item/${cartId}`);
  }

  updateProductData(data: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-products`, { data });
  }

  getPresignedUrlForFile(fileName: string, fileType: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get-presigned-url-for-file`, { fileName, fileType });
  }

  // Service Method to Fetch User Files
getUserFiles(): Observable<{ files: { key: string; url: string; type: string }[] }> {
  return this.http.get<{ files: { key: string; url: string, type: string }[] }>(`${this.apiUrl}/get-user-files`);
}


getUsers(): Observable<{ id: number, username: string }[]> {
  return this.http.get<{ id: number, username: string }[]>(`${this.apiUrl}/users`);
}

// getMessages(userId: number): Observable<{ sender: string, text: string }[]> {
//   console.log("UserId: ", userId);
//   return this.http.get<{ sender: string, text: string }[]>(`${this.apiUrl}/messages/${userId}`);
// }

getActiveUsers(): Observable<any[]> {
  return this.http.get<any[]>(`${this.apiUrl}/active-users`);
}

// listenForActiveUsers(callback: (users: any[]) => void) {
//   this.socket.on("activeUsers", (users) => {
//     callback(users);
//   });
// }
  
}

  

