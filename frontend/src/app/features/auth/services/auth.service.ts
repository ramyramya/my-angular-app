/*import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  signup(userData: any): Observable<any> {
    return this.http.post( `${environment.apiUrl}/auth/signup`, userData);
  }
}*/



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;  // Update with your base API URL

  constructor(private http: HttpClient) {}

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }


  isAuthenticated(): boolean {
    const token = sessionStorage.getItem('access_token');
    if (!token) return false;

    const decodedToken: any = jwt_decode(token);
    const expirationTime = decodedToken.exp * 1000;
    const currentTime = Date.now();

    return currentTime < expirationTime;
  }

  // Store tokens in localStorage or sessionStorage
  storeTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem('access_token', accessToken);
    sessionStorage.setItem('refresh_token', refreshToken);
  }

  // Clear tokens when user logs out
  clearTokens(): void {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
  }

  // Refresh the access token using the refresh token
  refreshAccessToken(): Observable<any> {
    const refreshToken = sessionStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    return this.http.post<any>(`${this.apiUrl}/refresh`, { refreshToken });
  }

  // Retrieve the access token (e.g., to include in HTTP request headers)
  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }
}

