import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import jwt_decode from 'jwt-decode';
import { AuthService } from '../../features/auth/services/auth.service';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router, private authService: AuthService) {}
  

  // canActivate(): boolean {
  //   const token = sessionStorage.getItem('access_token');

  //   if (token && !this.isTokenExpired(token)) {
  //     // Token is valid, allow access
  //     return true;
  //   }

  //   // Token is missing or expired, redirect to login
  //   this.router.navigate(['/auth/login']);
  //   return false;
    
  // }


  canActivate(): Observable<boolean> | boolean {
    const accessToken = sessionStorage.getItem('access_token');
    //const userId = this.authService.userId;

    

    // Check if access token is valid
    if (accessToken && !this.isTokenExpired(accessToken)) {
      return true;
    }

    // If access token is expired, fetch refresh token from database
    return this.authService.refreshAccessToken().pipe(
      map(response => {
        if (response?.accessToken) {
          sessionStorage.setItem('access_token', response.accessToken);
          return true;
        }
        this.router.navigate(['/auth/login']);
        return false;
      }),
      catchError(() => {
        this.router.navigate(['/auth/login']);
        return of(false);
      })
    );
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
