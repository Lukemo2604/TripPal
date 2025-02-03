import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupportComponent } from "../support/support.component"; // ✅ Import this to use ngClass

@Component({
  selector: 'login',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SupportComponent], // ✅ Add CommonModule here
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
