// user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private baseUrl = 'http://localhost:5000/api'; // Flask endpoint

  constructor(private http: HttpClient) {}

  getUser() {
    return this.http.get(`${this.baseUrl}/user`);
  }

  updateUser(data: any) {
    // We'll send the entire updated user object in PATCH /api/user
    return this.http.patch(`${this.baseUrl}/user`, data);
  }
}

