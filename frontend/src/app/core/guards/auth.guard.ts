import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const token = sessionStorage.getItem('access_token');

    if (token && !this.isTokenExpired(token)) {
      // Token is valid, allow access
      return true;
    }

    // Token is missing or expired, redirect to login
    this.router.navigate(['/auth/login']);
    return false;
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decodedToken: any = jwt_decode(token);  // Decode the token using jwt-decode
      const expirationDate = decodedToken.exp * 1000;  // Convert exp to milliseconds
      return expirationDate < Date.now();  // Check if token is expired
    } catch (e) {
      return true; // Return true if decoding fails (invalid token)
    }
  }
}
