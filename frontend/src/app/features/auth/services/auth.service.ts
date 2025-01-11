import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth/signup`;

  constructor(private http: HttpClient) {}

  signup(userData: any): Observable<any> {
    return this.http.post(this.apiUrl, userData);
  }
}
