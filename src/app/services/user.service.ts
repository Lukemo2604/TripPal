import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';  // <-- Import Observable

export interface FamilyMember {
  name: string;
  // Add additional fields as needed, e.g.:
  // relation?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:5000/api'; // Flask endpoint

  constructor(private http: HttpClient) {}

  getUser(): Observable<any> {
    return this.http.get(`${this.baseUrl}/user`);
  }

  updateUser(data: any): Observable<any> {
    // We'll send the entire updated user object in PATCH /api/user
    return this.http.patch(`${this.baseUrl}/user`, data);
  }

  getFamilyMembers(): Observable<FamilyMember[]> {
    return this.http.get<FamilyMember[]>(`${this.baseUrl}/family-members`);
  }
}


