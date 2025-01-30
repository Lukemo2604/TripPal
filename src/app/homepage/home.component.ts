import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'homepage',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
    Nav_login(): void {
        this.router.navigate(['/login']); // Ensure '/login' is a valid route in your app
      }

}