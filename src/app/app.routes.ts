import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/home.component';
import { LoginComponent } from './Login/login.component';
import { SupportComponent } from './support/support.component';
import { AccountComponent } from './account page/account.component';

// Import the guard
import { AuthGuard } from './guards/auth.guard';
import { TripComponent } from './trip view/trip.component';
import { TripsComponent } from './trips page/trips.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'support', component: SupportComponent },
  {
    path: 'trips',
    component: TripsComponent, // canActivate: [AuthGuard]
  },
  {
    path: 'trips/:tripId',
    component: TripComponent, // canActivate: [AuthGuard]
  },
  

  {
    path: 'account',
    component: AccountComponent,
    canActivate: [AuthGuard],  // <-- This protects the route
  },
];


