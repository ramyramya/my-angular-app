import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('access_token');

    if (token && !this.isTokenExpired(token)) {
      // Token is valid, redirect to dashboard
      this.router.navigate(['/dashboard']);
      return false;  // Prevent access to the current route
    }

    // Token is missing or expired, allow access
    return true;  // Allow access to the current route (e.g., login/signup)
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwt_decode(token);  // Decode the token using jwt-decode
      const expirationDate = decodedToken.exp * 1000;  // Convert exp to milliseconds
      return expirationDate < Date.now();  // Check if token is expired
    } catch (e) {
      return true; // Return true if decoding fails (invalid or malformed token)
    }
  }
}
