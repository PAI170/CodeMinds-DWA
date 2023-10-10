import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router } from '@angular/router';
import { Store } from '@store';
import { StorageKeys } from '@utils/constants';
import jwtDecode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivateChild {
  constructor(
    private router: Router,
    private store: Store
  ) {}

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    const token = localStorage.getItem(StorageKeys.ACCESS_TOKEN);
    const roles = route.data.roles;

    if(token == null) {
      this.router.navigate(['login']);
      return false;
    }

    
    try {
      const user = jwtDecode<any>(token);
      const isAuthorized = user.super_admin  || roles == null || roles.includes(user.role_id);

      if(!isAuthorized) {
        this.router.navigate(['error/forbidden']);
      }

      return isAuthorized;
    } catch (error) {
      this.store.closeSession();
      console.error(error);
      return false;
    }
  }
}
