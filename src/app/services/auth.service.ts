import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api'; // Update if different

  constructor(private http: HttpClient, private router: Router) {}

  // 1) Attempt login
  login(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/login`, { email, password });
  }

  // 2) Store token in localStorage
  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  // 3) Retrieve token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // 4) Check if user is logged in
  isLoggedIn(): boolean {
    return !!this.getToken(); // simple check (non-empty token)
  }

  // 5) Logout
  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }

  register(username: string, email: string, password: string) {
    return this.http.post(`${this.baseUrl}/register`, {
      username,
      email,
      password
    });
  }  
}
