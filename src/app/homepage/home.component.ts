import { CommonModule } from '@angular/common';
import { AfterViewInit, Component } from '@angular/core';
import { Router } from '@angular/router';
import { SupportComponent } from "../support/support.component";
import AOS from 'aos';
import 'aos/dist/aos.css';

@Component({
  selector: 'homepage',
  standalone: true,
  imports: [CommonModule, SupportComponent],
  templateUrl: './home.component.html',

})
export class HomeComponent implements AfterViewInit{

  ngAfterViewInit(): void {
    AOS.init({
      duration: 800,
      once: true,
    });
  }

  constructor(private router: Router) {} // Inject Router in the constructor

  navigateToLogin() {
    const currentUrl = this.router.url; // Capture the current URL
    localStorage.setItem('redirect_url', currentUrl); // Save the URL for redirection post-login
    this.router.navigate(['/login']); // Navigate to the login page
  }
}
