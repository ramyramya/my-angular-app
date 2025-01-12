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

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getUserData(): Observable<{ username: string; profile_pic: string }> {
    return this.http.get<{ username: string; profile_pic: string }>(`${this.apiUrl}/user-info`);
  }

  getPresignedUrl(fileName: string, fileType: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/get-presigned-url`, { fileName, fileType });
  }


  updateProfilePic(fileUrl: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/update-profile-pic`, { fileUrl });
  }
  
}

  

