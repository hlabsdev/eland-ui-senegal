import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { ConfigService } from '@app/core/app-config/config.service';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TranslateService } from '@ngx-translate/core';
import { ApplicationPreferences } from '@app/core/models/branding/application-preferences.model';
import { ApplicationPreferencesService } from '@app/core/services/application-preferences.service';
import { forkJoin, from, Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppLinkGroup } from '../models/applinkgroup.model';
import { Quicklink } from '../models/quicklink.model';
@Injectable({
    providedIn: 'root',
})
export class QuicklinkService implements OnInit, OnDestroy {
    quicklinks$: Observable<Quicklink[]>;
    appLinks: AppLinkGroup[];
    translateLinks: Subscription;
    quicklinksInitial: Quicklink[];

    // User Guide ULR from config
    userGuideUrl: string;

    // shared application preference
    applicationPreferences: ApplicationPreferences;

    constructor(
        private applicationPreferencesService: ApplicationPreferencesService,
        private translateService: TranslateService,
        public appAuthGuard: AppAuthGuard,
        private config: ConfigService,
    ) {}

    // eslint-disable-next-line @angular-eslint/contextual-lifecycle
    ngOnInit(): void {
        this.userGuideUrl = this.config.getDefaultConfig('EXTERNAL_SERVICES.user_guide_url');
    }
    getQuicklinks(): Observable<Quicklink[]> {
        const toSelectQLs = from(this.initToSelectQuicklinks());
        return forkJoin([toSelectQLs]).pipe(
            map((_selectedQLs) => {
                this.quicklinksInitial = [
                    { ..._selectedQLs[0][3].appLinksGroupName[0], id: 1 },
                    { ..._selectedQLs[0][3].appLinksGroupName[1], id: 2 },
                    { ..._selectedQLs[0][4].appLinksGroupName[0], id: 3 },
                ];
                return this.quicklinksInitial;
            }),
        );
    }

    initToSelectQuicklinks() {
        return new Promise((resolve, reject) => {
            this.translateLinks = this.translateService.stream(['HEADER']).subscribe((values) => {
                const appPreference =
                    this.applicationPreferencesService.getApplicationPreferenceFromStore('applicationPreferences');
                this.appLinks = [
                    {
                        appLinksGroupName: [
                            {
                                id: null,
                                name: values.HEADER.HOME,
                                url: '/home',
                                group: values.HEADER.HOME,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.TASKS,
                                url: '/tasks-list',
                                group: values.HEADER.HOME,
                                target: '_self',
                            },
                        ],
                    },
                    {
                        appLinksGroupName: [
                            {
                                id: null,
                                name: values.HEADER.PROCESSES,
                                url: '/processes',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.TRANSACTIONS,
                                url: '/transactions',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.CODE_LIST,
                                url: '/code-lists',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.DASHBOARD,
                                url: '/camunda/app/admin/default/setup/#/setup',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.FORMS_GROUP,
                                url: '/forms-group',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.PARAMETERS,
                                url: '/parameters',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                                queryParamsKey: 'param',
                                queryParamsValue: 'territory',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                            {
                                id: null,
                                name: values.HEADER.PARAMETERS,
                                url: '/parameters',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                                queryParamsKey: 'param',
                                queryParamsValue: 'registry',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                            {
                                id: null,
                                name: values.HEADER.PARAMETERS,
                                url: '/parameters',
                                group: values.HEADER.ADMIN,
                                target: '_self',
                                queryParamsKey: 'param',
                                queryParamsValue: 'responsibleOffice',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                        ],
                    },
                    {
                        appLinksGroupName: [
                            {
                                id: null,
                                name: values.HEADER.APPLICATIONS,
                                url: '/applicants',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.BA_UNITS_REGISTERED,
                                url: '/ba-units/registered',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.RDAI,
                                url: '/rdais',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.OPPOSITION_REGISTRY,
                                url: '/oppositionsregistry',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.GENERAL_FORMALITY_REGISTRY,
                                url: '/generalFormalityRegistries',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.REGISTRE_FORMALITY,
                                url: '/preregistrationFormalities',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                            {
                                id: null,
                                name: values.HEADER.DIVISION_REGISTRY,
                                url: '/divisionRegistries',
                                group: values.HEADER.WORKSTATION,
                                target: '_self',
                            },
                        ],
                    },
                    {
                        appLinksGroupName: [
                            {
                                id: null,
                                name: values.HEADER.USER_PROFILE,
                                url: 'profile-settings',
                                group: values.HEADER.PROFILE_AND_PREFERENCES,
                                target: '_self',
                                queryParamsKey: 'setting',
                                queryParamsValue: 'user_profile',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                            {
                                id: null,
                                name: values.HEADER.SESSION_PREFERENCES,
                                url: 'profile-settings',
                                group: values.HEADER.PROFILE_AND_PREFERENCES,
                                target: '_self',
                                queryParamsKey: 'setting',
                                queryParamsValue: 'session_preferences',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                            {
                                id: null,
                                name: values.HEADER.APPLICATION_PREFERENCES,
                                url: 'profile-settings',
                                group: values.HEADER.PROFILE_AND_PREFERENCES,
                                target: '_self',
                                queryParamsKey: 'setting',
                                queryParamsValue: 'application_preferences',
                                queryParamsFragment: '',
                                queryParamsHandling: '',
                            },
                            {
                                id: null,
                                name: values.HEADER.USER_GUIDE,
                                url: this.userGuideUrl,
                                group: values.HEADER.PROFILE_AND_PREFERENCES,
                                target: '_blank',
                            },
                        ],
                    },
                    {
                        appLinksGroupName: [
                            {
                                id: null,
                                name: values.HEADER.EXTERNAL_LINKS,
                                url: appPreference.organizationWebsite,
                                group: appPreference.organizationName,
                                target: '_blank',
                            },
                        ],
                    },
                ];
                resolve(this.appLinks);
            }, reject);
        });
    }

    ngOnDestroy() {
        this.translateLinks.unsubscribe();
    }
}
