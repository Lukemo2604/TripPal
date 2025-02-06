import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from "../support/support.component";

@Component({
  selector: 'account',
  standalone: true,
  imports: [CommonModule, SupportComponent],
  templateUrl: './account.component.html',
  styleUrl: './account.component.css',
})
export class AccountComponent {
  activeSection: string = 'about'; // Default section

  setActiveSection(section: string) {
    this.activeSection = section;
  }

  logout() {
    console.log("Logging out...");
    // Here, you can implement actual logout logic, e.g., clearing auth tokens.
  }
}
