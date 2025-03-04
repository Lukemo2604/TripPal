import { Component } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Import your AuthService

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [ RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  toggleNav(): void {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav) {
      sidenav.style.width = sidenav.style.width === "300px" ? "0" : "300px";
    }
  }

  isLoggedIn() {
    return this.authService.isLoggedIn();
  }

  logout() {
    this.authService.logout();
    // The service will remove the token & navigate to /login
  }
}



