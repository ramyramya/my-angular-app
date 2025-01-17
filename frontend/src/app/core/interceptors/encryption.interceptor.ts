
import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../../environments/environment';

@Injectable()
export class EncryptionInterceptor implements HttpInterceptor {
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
      })
    );
  }
}