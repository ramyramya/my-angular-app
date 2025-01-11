import { Injectable } from '@angular/core';
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
