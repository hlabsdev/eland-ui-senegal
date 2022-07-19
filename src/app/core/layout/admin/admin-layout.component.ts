import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Router,NavigationStart, Event as NavigationEvent } from '@angular/router';
import { Location } from '@angular/common';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './admin-layout.component.html',
})
export class AdminLayoutComponent implements OnInit, OnDestroy {

    menu1: MenuItem[];
    menu2: MenuItem[];

    toggle: boolean = false;
    showRoute: boolean = false;

    event$;
    
    constructor(private translateService: TranslateService, private location: Location,
        private breakpointObserver: BreakpointObserver, router: Router) {
        this.location.path() === '/administration' ? this.showRoute = false : this.showRoute = true;
        this.event$
        = router.events
            .subscribe(
                (event: NavigationEvent) => {
                if(event instanceof NavigationStart) {
                    event.url === '/administration' ? this.showRoute = false : this.showRoute = true;
                }
            });
    }

    ngOnInit(): void {
        this.breakpointObserver.observe([
            "(max-width: 768px)"
          ]).subscribe((result: BreakpointState) => result.matches ? this.toggle = true : this.toggle = false);

        this.menu1 = [
            {
                label: this.translateService.instant('HEADER.RRR_VALIDATION'),
                routerLink: 'rrr-validations',
            },
            {
                label: this.translateService.instant('HEADER.CODE_LIST'),
                routerLink: 'code-lists'
            },
        ];

        this.menu2 = [
            {
                label: this.translateService.instant('PARAMETERS.TERRITORY.TITLE'),
                items: [
                    {
                        label: this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.TITLE'), 
                        routerLink: 'parameters?param=territory&territory=Country'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.TERRITORY.REGION.TITLE'), 
                        routerLink: 'parameters?param=territory&territory=Region'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.TERRITORY.CIRCLE.TITLE'), 
                        routerLink: 'parameters?param=territory&territory=Circle'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.TITLE'), 
                        routerLink: 'parameters?param=territory&territory=Division'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.TERRITORY.DISTRICT.TITLE'), 
                        routerLink: 'parameters?param=territory&territory=District'
                    }
                ]
            },
            {
                label: this.translateService.instant('PARAMETERS.REGISTRY.TITLE'),
                routerLink: 'registry'
            },
            {
                label: this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.TITLE'),
                routerLink: 'responsibleOffice'
            },
            {
                label: this.translateService.instant('FORMS.TITLE'),
                items: [
                    {
                        label: this.translateService.instant('FORMS_GROUP.TITLE'), 
                        routerLink: 'parameters?param=territory'
                    },
                    {
                        label: this.translateService.instant('FORMS.TITLE'), 
                        routerLink: 'parameters?param=territory'
                    },
                ]
            },
            {
                label: this.translateService.instant('PARAMETERS.LANGUAGE.TITLE'),
                items: [
                    {
                        label: this.translateService.instant('PARAMETERS.LOCALE.TITLE'), 
                        routerLink: 'parameters?param=territory'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.LANGUAGE.TITLE'), 
                        routerLink: 'parameters?param=territory'
                    },
                    {
                        label: this.translateService.instant('PARAMETERS.TRANSLATION.TITLE'), 
                        routerLink: 'parameters?param=territory'
                    },
                ]
            },
            {
                label: this.translateService.instant('HEADER.APPLICATION_PREFERENCES'),
                items: [
                    {
                        label: this.translateService.instant('USER_SETTINGS.APPLICATION_PREFERENCES_TAB.VISUAL_IDENTITY'), 
                        routerLink: 'profile-settings'
                    },
                ]
            },
        ];
    }

    ngOnDestroy() {
        this.event$.unsubscribe();
    }
    
    toggleMenu(){
        var sidebar = document.getElementById('sidebar');
        sidebar.classList.contains('active') ? this.toggle = false : this.toggle = true;
    }
}
