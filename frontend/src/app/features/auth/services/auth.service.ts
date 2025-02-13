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
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  userId!:number;
  private apiUrl = `${environment.apiUrl}/auth`;  // Update with your base API URL

  constructor(private http: HttpClient, private router: Router) {}

  login(loginData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/signup`, userData);
  }


  setUser(userId:number){
    this.userId = userId;
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
  storeTokens(accessToken: string): void {
    sessionStorage.setItem('access_token', accessToken);
    //sessionStorage.setItem('refresh_token', refreshToken);
  }

  // Clear tokens when user logs out
  clearTokens(): void {
    sessionStorage.removeItem('access_token');
    //sessionStorage.removeItem('refresh_token');
  }

  // Refresh the access token using the refresh token
  refreshAccessToken(): Observable<any> {
    const user_id = sessionStorage.getItem('user_id');
    

    return this.http.post<any>(`${this.apiUrl}/refresh/${user_id}`, {});
  }

  // Retrieve the access token (e.g., to include in HTTP request headers)
  getAccessToken(): string | null {
    return sessionStorage.getItem('access_token');
  }


  sendPasswordResetEmail(email: string): Observable<any> {
    const url = `${this.apiUrl}/forgot-password`; 
    return this.http.post(url, { email });
  }


  resetPassword(token: string, newPassword: string): Observable<any> {
    const url = `${this.apiUrl}/reset-password`;
    return this.http.post(url, { token, newPassword });
    
  }


  logout(): void{
    this.clearTokens();
    sessionStorage.removeItem('user_id');
    this.userId = 0;
    this.router.navigateByUrl('/auth/login');
  }
}

