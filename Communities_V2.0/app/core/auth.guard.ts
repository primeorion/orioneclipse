import { Injectable }        from '@angular/core';
import { CanActivate,CanActivateChild,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot }    from '@angular/router';
import { AuthService }       from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate , CanActivateChild{
    constructor(private authService: AuthService, private router: Router) { }
    canActivate(
        // Not using but worth knowing about
        next: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ) {
        if (this.authService.isLoggedIn) { return true; }
        this.router.navigate(['/login']);
        return false;
    }
    
    canActivateChild( next: ActivatedRouteSnapshot,state: RouterStateSnapshot) {
        if (this.authService.isLoggedIn) { return true; }
        this.router.navigate(['/login']);
        return false;
    }
}
