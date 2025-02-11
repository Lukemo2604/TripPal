import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/home.component';
import { LoginComponent } from './Login/login.component';
import { SupportComponent } from './support/support.component';
import { AccountComponent } from './account page/account.component';

// Import the guard
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'support', component: SupportComponent },

  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard],  // <-- This protects the route
  },
];


