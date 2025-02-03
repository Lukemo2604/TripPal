import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'support',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  supportData = {
    name: '',
    email: '',
    message: ''
  };

  submissionSuccess = false;

  submitIssue() {
    console.log("Support Issue Submitted:", this.supportData);
    // Simulating an API request (can be replaced with a real HTTP call)
    setTimeout(() => {
      this.submissionSuccess = true;
    }, 1000);
    
    // Reset form after submission
    this.supportData = { name: '', email: '', message: '' };
  }
}

