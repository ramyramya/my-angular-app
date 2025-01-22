
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../features/auth/services/auth.service';

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  private secretKey = environment.secretKey;

  // Method to encrypt data before sending the request
  encrypt(data: any): string {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), this.secretKey).toString();
    return encrypted;
  }

  // Method to decrypt response data after receiving the response
  decrypt(encryptedData: string): any {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.secretKey);
      const decrypted = bytes.toString(CryptoJS.enc.Utf8);
      return JSON.parse(decrypted); // Parse the decrypted string into an object
    } catch (error) {
      console.error("Decryption failed:", error);
      return null;
    }
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.log("EncryptionInterceptor triggered");

    const token = sessionStorage.getItem('access_token');

    // Encrypt the request body if it exists
    if (req.body) {
      console.log("Encrypting request body");
      const encryptedBody = this.encrypt(req.body);
      req = req.clone({
        body: { payload: encryptedBody } // Wrap the encrypted body in a `payload` object
      });
    }


    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `${token}`,
        },
      });
    }

    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        console.log("Interceptor event:", event);

        if (event instanceof HttpResponse && event.body && event.body.encrypted) {
          //console.log("Encrypted Response Body:", event.body.encrypted);

          try {
            // Decrypt the response body
            const decryptedBody = this.decrypt(event.body.encrypted);
            //console.log("Decrypted Body:", decryptedBody);

            // Clone the response and replace the body with the decrypted one
            const clonedResponse = event.clone({ body: decryptedBody });

            return clonedResponse; // Return the modified cloned response
          } catch (error) {
            console.error("Decryption failed", error);
          }
        }

        return event; // Return the modified event with the decrypted body
      }),

      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          // Handle the refresh token logic for expired access token
          console.log("Access token expired, refreshing...");

          return this.authService.refreshAccessToken().pipe(
            switchMap((tokens: any) => {
              // Store the new tokens
              this.authService.storeTokens(tokens.accessToken, tokens.refreshToken);

              // Clone the original request and add the new access token
              const clonedRequest = req.clone({
                setHeaders: {
                  Authorization: `${tokens.accessToken}`,
                },
              });

              // Retry the original request with the new access token
              return next.handle(clonedRequest);
            }),

            catchError((refreshError) => {
              // Handle error if refresh token fails, maybe log out the user
              console.error("Refresh token failed", refreshError);
              this.authService.clearTokens(); // Optionally, clear tokens and redirect to login
              this.authService.logout();
              return throwError(()=>refreshError); // Return an error if refresh fails
            })
          );
        }

        return throwError(()=>error); // Return the error if it's not a 401
      })
    );
  }
}