import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ConfigService } from '@app/core/app-config/config.service';
import { AccessRights } from '@app/core/models/accessRight';
import { User } from '@app/core/models/user.model';
import { AppAuthGuard } from '@app/core/utils/keycloak/app-auth-guard';
import { TranslateService } from '@ngx-translate/core';
import { SelectItemGroup } from 'primeng/api';
import { Observable } from 'rxjs';
import { Quicklink } from '@app/features/quicklink/models/quicklink.model';

@Component({
    selector: 'app-actions-quicklink-dialog',
    templateUrl: './actions-quicklink-dialog.component.html',
    styleUrls: ['./actions-quicklink-dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddQuicklinkComponent implements OnInit {
    @Input() display: boolean;
    @Output() setClick = new EventEmitter();
    @Output() duplicateClick = new EventEmitter();
    @Output() deleteClick = new EventEmitter();

    @Input() selectedQuicklink: Quicklink;
    isSelected: boolean;

    groupOptions: SelectItemGroup[];
    groupOptions$: Observable<SelectItemGroup[]>;

    // for QLs filtering
    user: User;
    hasSystemAdministratorAccess: boolean;
    hasTransactionAccess: boolean;
    hasDashboardAccess: boolean;
    hasWorkstationAccess: boolean;
    hasAdminMenuAccess: boolean;
    hasWorkstationMenuAccess: boolean;

    // User Guide ULR from config
    userGuideUrl: string;
    workflowEngineDomain: string;
    hasSigtasAccess: boolean;

    constructor(
        private translateService: TranslateService,
        public appAuthGuard: AppAuthGuard,
        private config: ConfigService,
    ) {}

    ngOnInit() {
        this.user = this.appAuthGuard.getUser();

        this.hasSystemAdministratorAccess = this.user.hasPermission(AccessRights.SYSTEM_ADMINISTRATOR);

        this.hasTransactionAccess = this.user.hasSomePermissions([
            AccessRights.MANUALLY_START_TRANSACTION,
            AccessRights.SYSTEM_ADMINISTRATOR,
        ]);

        this.hasDashboardAccess = this.user.hasSomePermissions([
            AccessRights.SYSTEM_ADMINISTRATOR,
            AccessRights.SEE_TRANSACTION_INSTANCES,
        ]);

        this.hasWorkstationAccess = this.user.hasSomePermissions([
            AccessRights.SYSTEM_ADMINISTRATOR,
            AccessRights.SEE_WORKSTATION_MENU,
        ]);

        this.hasSigtasAccess = this.user.hasSomePermissions([AccessRights.SYSTEM_ADMINISTRATOR, AccessRights.SIGTAS]);

        this.hasAdminMenuAccess =
            this.hasSystemAdministratorAccess || this.hasTransactionAccess || this.hasDashboardAccess;
        this.hasWorkstationMenuAccess = this.hasWorkstationAccess || this.hasSigtasAccess;

        this.userGuideUrl = this.config.getDefaultConfig('EXTERNAL_SERVICES.user_guide_url');
        this.workflowEngineDomain = this.config.getDefaultConfig('EXTERNAL_SERVICES.workflow-url');

        this.translateService.get(['HEADER', 'PARAMETERS']).subscribe((values) => {
            const qLGroup_Home = [
                {
                    label: values.HEADER.HOME,
                    value: {
                        id: null,
                        name: values.HEADER.HOME,
                        url: '/home',
                        group: values.HEADER.HOME,
                        target: '_self',
                    },
                },
            ];
            const qlGroup_Administration = [];
            const qlGroup_Workstation = [];
            const qlGroup_UserSettings = [
                {
                    label: values.HEADER.USER_PROFILE,
                    value: {
                        id: null,
                        name: values.HEADER.USER_PROFILE,
                        url: '/profile-settings',
                        group: values.HEADER.PROFILE_AND_PREFERENCES,
                        target: '_self',
                    },
                },
                {
                    label: values.HEADER.USER_GUIDE,
                    value: {
                        id: null,
                        name: values.HEADER.USER_GUIDE,
                        url: this.userGuideUrl,
                        group: values.HEADER.PROFILE_AND_PREFERENCES,
                        target: '_blank',
                    },
                },
            ];
            const qlGroup_CoBrand = [
                {
                    label: values.HEADER.EXTERNAL_LINKS,
                    value: {
                        id: null,
                        name: values.HEADER.EXTERNAL_LINKS,
                        url: '',
                        group: values.HEADER.DEFAULT_COBRAND,
                        target: '_blank',
                    },
                },
            ];

            if (this.user) {
                const qLGroup_Home_current = qLGroup_Home;
                let qlGroup_Administration_current = qlGroup_Administration;
                let qlGroup_Workstation_current = qlGroup_Workstation;
                const qlGroup_UserSettings_current = qlGroup_UserSettings;
                const qlGroup_CoBrand_current = qlGroup_CoBrand;

                if (this.hasAdminMenuAccess) {
                    if (this.hasSystemAdministratorAccess) {
                        qlGroup_Administration_current = [
                            ...qlGroup_Administration_current,
                            {
                                label: values.HEADER.PROCESSES,
                                value: {
                                    id: null,
                                    name: values.HEADER.PROCESSES,
                                    url: '/processes',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.CODE_LIST,
                                value: {
                                    id: null,
                                    name: values.HEADER.CODE_LIST,
                                    url: '/code-lists',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.RRR_VALIDATION,
                                value: {
                                    id: null,
                                    name: values.HEADER.RRR_VALIDATION,
                                    url: '/rrr-validations',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.TERRITORY.TITLE,
                                value: {
                                    id: null,
                                    name: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.TERRITORY.TITLE,
                                    url: 'administration/parameters?param=territory',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.REGISTRY.TITLE,
                                value: {
                                    id: null,
                                    name: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.REGISTRY.TITLE,
                                    url: 'administration/registry',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.RESPONSIBLE_OFFICE.TITLE,
                                value: {
                                    id: null,
                                    name: values.HEADER.PARAMETERS + ' > ' + values.PARAMETERS.RESPONSIBLE_OFFICE.TITLE,
                                    url: 'administration/parameters?param=responsibleOffice',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                        ];
                    }
                    if (this.hasTransactionAccess) {
                        qlGroup_Administration_current = [
                            ...qlGroup_Administration_current,
                            {
                                label: values.HEADER.TRANSACTIONS,
                                value: {
                                    id: null,
                                    name: values.HEADER.TRANSACTIONS,
                                    url: '/transactions',
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                        ];
                    }
                    if (this.hasDashboardAccess) {
                        qlGroup_Administration_current = [
                            ...qlGroup_Administration_current,
                            {
                                label: values.HEADER.DASHBOARD,
                                value: {
                                    id: null,
                                    name: values.HEADER.DASHBOARD,
                                    url: this.workflowEngineDomain,
                                    group: values.HEADER.ADMIN,
                                    target: '_self',
                                },
                            },
                        ];
                    }
                }
                if (this.hasWorkstationMenuAccess) {
                    if (this.hasWorkstationAccess) {
                        qlGroup_Workstation_current = [
                            ...qlGroup_Workstation_current,
                            {
                                label: values.HEADER.APPLICATIONS,
                                value: {
                                    id: null,
                                    name: values.HEADER.APPLICATIONS,
                                    url: '/applicants',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.BA_UNITS_REGISTERED,
                                value: {
                                    id: null,
                                    name: values.HEADER.BA_UNITS_REGISTERED,
                                    url: '/ba-units/registered',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.RDAI,
                                value: {
                                    id: null,
                                    name: values.HEADER.RDAI,
                                    url: '/rdais',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.REGISTRE_FORMALITY,
                                value: {
                                    id: null,
                                    name: values.HEADER.REGISTRE_FORMALITY,
                                    url: '/preregistrationFormalities',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.GENERAL_FORMALITY_REGISTRY,
                                value: {
                                    id: null,
                                    name: values.HEADER.GENERAL_FORMALITY_REGISTRY,
                                    url: '/generalformalityRegisters',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                            {
                                label: values.HEADER.DIVISION_REGISTRY,
                                value: {
                                    id: null,
                                    name: values.HEADER.DIVISION_REGISTRY,
                                    url: '/DivisionRegistrys',
                                    group: values.HEADER.WORKSTATION,
                                    target: '_self',
                                },
                            },
                        ];
                    }
                }

                this.groupOptions = [
                    { label: values.HEADER.HOME, items: qLGroup_Home_current },
                    { label: values.HEADER.ADMIN, items: qlGroup_Administration_current },
                    {
                        label: values.HEADER.WORKSTATION,
                        items: qlGroup_Workstation_current,
                    },
                    {
                        label: values.HEADER.PROFILE_AND_PREFERENCES,
                        items: qlGroup_UserSettings_current,
                    },
                    {
                        label: values.HEADER.DEFAULT_COBRAND,
                        items: qlGroup_CoBrand_current,
                    },
                ];
            }
        });
    }

    onChangeQuicklink(change: Quicklink) {
        this.selectedQuicklink = {
            id: change.id,
            name: change.name,
            group: change.group,
            url: change.url,
            target: change.target,
        };
        this.isSelected = true;
    }

    set() {
        if (this.isSelected) {
            this.setClick.emit(this.selectedQuicklink);
        }
    }

    duplicate() {
        this.duplicateClick.emit();
    }

    delete() {
        this.deleteClick.emit();
    }
}
