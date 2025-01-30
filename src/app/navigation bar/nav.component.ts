import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'navigation',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.css',
})
export class NavComponent {
  
  toggleNav(): void {
    const sidenav = document.getElementById("mySidenav");
    if (sidenav) {
      sidenav.style.width = sidenav.style.width === "300px" ? "0" : "300px";
    }
  }
}


