/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getUserData(): Observable<{ username: string; thumbnail: string }> {
    return this.http.get<{ username: string; thumbnail: string }>(`${this.apiUrl}/user-info`);
  }
}
  */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getUserData(): Observable<{ username: string; profile_pic: string; email: string }> {
    return this.http.get<{ username: string; profile_pic: string; email: string }>(`${this.apiUrl}/user-info`);
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
  
  
}

  

