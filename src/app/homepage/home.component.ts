import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {

  constructor(private router: Router) {} // Inject Router in the constructor

  navigateToLogin() {
    const currentUrl = this.router.url; // Capture the current URL
    localStorage.setItem('redirect_url', currentUrl); // Save the URL for redirection post-login
    this.router.navigate(['/login']); // Navigate to the login page
  }
}
