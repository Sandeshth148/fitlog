import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { UserService } from '../services/user.service';

@Injectable({
  providedIn: 'root'
})
export class HeightSetupGuard implements CanActivate {
  constructor(
    private userService: UserService,
    private router: Router
  ) {}
  
  async canActivate(): Promise<boolean | UrlTree> {
    const isProfileComplete = await this.userService.isProfileComplete();
    
    if (!isProfileComplete) {
      // Redirect to setup page if height is not set
      return this.router.parseUrl('/setup');
    }
    
    return true;
  }
}
