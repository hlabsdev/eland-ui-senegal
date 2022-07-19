import { Injectable, EventEmitter } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { KeycloakService, KeycloakAuthGuard } from 'keycloak-angular';
import { User } from '@app/core/models/user.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';

@Injectable()
export class AppAuthGuard extends KeycloakAuthGuard {
    private user: User;
    userChange: EventEmitter<any> = new EventEmitter();

    constructor(
        protected router: Router,
        protected keycloakAngular: KeycloakService,
        private alertService: AlertService,
        private translate: TranslateService,
        private utilService: UtilService,
    ) {
        super(router, keycloakAngular);
    }

    isAccessAllowed(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
        return new Promise((resolve, reject) => {
            if (!this.authenticated) {
                this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
                return false;
            }

            return this.keycloakAngular.loadUserProfile().then((profile) => {
                this.user = new User(profile);
                this.user.roles = this.keycloakAngular.getUserRoles();
                this.notifyAndStore(this.user);
                const lang = this.utilService.loadLanguagePreferencesFromLocalStorage(this.user.username);
                if (lang) {
                    this.translate.use(lang);
                }

                const { accessData } = route.data;
                const hasAccess = this.user.hasEveryPermission(accessData);

                // allows the access in case there is no route.data.accessData for a route for now.
                if (hasAccess || !accessData) {
                    return resolve(true);
                } else {
                    this.router.navigate(['home']);
                    this.alertService.warning('MESSAGES.ACCESS_DENIED');
                    return resolve(true);
                }
            });
        });
    }

    setUser(user: User) {
        this.user = user;
        this.notifyAndStore(this.user);
    }

    getUser(): User {
        return this.user;
    }

    private notifyAndStore(user: User) {
        this.userChange.emit(user);
        return user
            ? localStorage.setItem('currentUser', JSON.stringify(user))
            : localStorage.removeItem('currentUser');
    }
}
