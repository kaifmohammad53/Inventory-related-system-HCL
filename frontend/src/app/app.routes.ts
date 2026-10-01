import { Routes } from '@angular/router';
import { PageComponent } from './page.component';
import { LoginComponent } from './login.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER', 'SUPPLIER'] },
  },
  {
    path: 'products',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'STORE_MANAGER', 'WAREHOUSE_MANAGER'] },
  },
  {
    path: 'inventory',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'] },
  },
  {
    path: 'warehouses',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER'] },
  },
  {
    path: 'suppliers',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'SUPPLIER', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'] },
  },
  {
    path: 'purchase-orders',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER'] },
  },
  {
    path: 'orders',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'STORE_MANAGER'] },
  },
  {
    path: 'reports',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN', 'WAREHOUSE_MANAGER', 'STORE_MANAGER'] },
  },
  {
    path: 'audit-logs',
    component: PageComponent,
    canActivate: [authGuard],
    data: { roles: ['ADMIN'] },
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
