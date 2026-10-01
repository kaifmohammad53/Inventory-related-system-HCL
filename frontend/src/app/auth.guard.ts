import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole') || '';
  const router = inject(Router);

  if (!token) {
    return router.parseUrl('/login');
  }

  const expectedRoles: string[] = route.data?.['roles'] || [];
  if (expectedRoles.length > 0 && !expectedRoles.includes(userRole)) {
    // User does not have authorization for this route
    return router.parseUrl('/dashboard');
  }

  return true;
};
