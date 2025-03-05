import { FormsModule } from '@angular/forms'; // <-- add this
import { Component } from '@angular/core';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupportComponent } from '../support/support.component';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,            // <-- add to imports
    RouterOutlet,
    RouterModule,
    SupportComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isSignupVisible = false;

  // We'll bind these to the login form
  username = '';
  password = '';

  // For signup
  newUsername = '';
  newEmail = '';
  newPassword = '';

  errorMsg = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleSignupForm() {
    this.isSignupVisible = !this.isSignupVisible;
  }

  login() {
    // Use this.username & this.password
    this.authService.login(this.username, this.password).subscribe({
      next: (res: any) => {
        if (res.token) {
          this.authService.setToken(res.token);
          this.router.navigate(['/account']);
        }
      },
      error: (err) => {
        this.errorMsg = err.error?.error || 'Invalid credentials';
      }
    });
  }

  signup() {
    this.authService.register(this.newUsername, this.newEmail, this.newPassword)
      .subscribe({
        next: (res: any) => {
          // If your Flask /api/register returns { token, userId }, handle it here
          if (res.token) {
            this.authService.setToken(res.token);
            this.router.navigate(['/account']);
          }
        },
        error: (err) => {
          console.error('Signup error:', err);
          this.errorMsg = err.error?.error || 'Signup failed';
        }
      });
  }
  
}
