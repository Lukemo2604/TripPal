import { Routes } from '@angular/router';
import { HomeComponent } from './homepage/home.component';
import { LoginComponent } from './Login/login.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
      },
      {
        path: 'login',
        component: LoginComponent
      },
];
