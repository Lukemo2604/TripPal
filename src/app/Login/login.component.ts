import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // ✅ Import this to use ngClass

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule], // ✅ Add CommonModule here
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  isSignupVisible = false; // Controls visibility of sign-up form

  toggleSignupForm() {
    this.isSignupVisible = !this.isSignupVisible; // Toggles sign-up form visibility
  }

  login() {
    console.log("Login function called"); // Placeholder for login logic
    return true;
  }

  signup() {
    console.log("Signup function called"); // Placeholder for sign-up logic
    return true;
  }
}
