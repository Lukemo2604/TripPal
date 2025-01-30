import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'loginpage',
  standalone: true,
  imports: [RouterOutlet, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class loginComponent {}