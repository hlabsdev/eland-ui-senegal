import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { UtilService } from '@app/core/utils/util.service';
import { UserService } from '@app/core/services/user.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { User } from '@app/core/models/user.model';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import { KeycloakAdminService } from '@app/core/services/KeycloakAdminService.component';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { forkJoin } from 'rxjs';

@Component({
    selector: 'app-user-choice',
    templateUrl: './user-choice.component.html',
})
export class UserChoiceComponent implements OnInit, OnChanges {
    errorMessage: string;
    rowSizes: any = RowSizes;
    @Input() dialogOptions: DialogOptions;
    baseUsers: User[];
    users: SelectItem[];
    responsibleOffices: ResponsibleOffice[];
    responsibleOfficesRoles: string[];

    constructor(
        private keycloakAdminService: KeycloakAdminService,
        private utilService: UtilService,
        private parametersService: ParametersService,
        private userService: UserService,
    ) {}

    ngOnInit() {
        forkJoin([this.parametersService.getAllResponsibleOffices(), this.keycloakAdminService.getUsers()]).subscribe(
            ([responsibleOffices, users]) => {
                // TODO :: ASK JP what kind of filters he wants ??
                this.responsibleOffices = responsibleOffices;
                this.getResponsibleOfficesRoles();
                this.baseUsers = this.filterByRoles(this.responsibleOfficesRoles, users);
                this.users = this.getSelectItemUsers(this.getFilteredUsers());
            },
        );
    }

    ngOnChanges(changes: SimpleChanges) {
        this.users = this.getSelectItemUsers(this.getFilteredUsers());
    }

    getResponsibleOfficesRoles() {
        this.responsibleOfficesRoles = this.responsibleOffices.map(
            (responsibleOffice) => responsibleOffice.correspondingRole,
        );
    }

    getSelectItemUsers(users): SelectItem[] {
        const tmpUsers = users.map((user) => user.toSelectItemFull());
        this.utilService.addSelectPlaceholder(tmpUsers);
        return tmpUsers;
    }

    filterByRoles = (roles: string[], users: User[]) =>
        _.filter(users, (user) => user.realmRoles.some((role) => roles.includes(role)));

    getFilteredUsers(): User[] {
        let tmpUsers = this.baseUsers;
        const filters = this.prepareFilters();
        if (filters.length > 0) {
            _.forEach(filters, (filter) => {
                if (filter === 'LAND_RESPONSIBLE_OFFICE') {
                    const landRole = this.getLandRole();
                    if (landRole) {
                        tmpUsers = this.filterByRoles([this.getLandRole()], tmpUsers);
                    }
                } else if (filter === 'USER_RESPONSIBLE_OFFICE') {
                    tmpUsers = this.filterByRoles(
                        _.filter(this.userService.getCurrentUser().roles, (role) =>
                            this.responsibleOfficesRoles.includes(role),
                        ),
                        tmpUsers,
                    );
                } else if (filter === 'USER_ROLES') {
                    tmpUsers = this.filterByRoles(this.userService.getCurrentUser().roles, tmpUsers);
                } else if (filter.includes('ROLES')) {
                    tmpUsers = this.filterByRoles(filter.substring(filter.indexOf(':') + 1).split(';'), tmpUsers);
                }
            });
        }
        return tmpUsers;
    }

    prepareFilters(): any[] {
        const availableFilters = ['LAND_RESPONSIBLE_OFFICE', 'USER_RESPONSIBLE_OFFICE', 'USER_ROLES', 'ROLES'];
        const filters =
            this.dialogOptions && this.dialogOptions.filters
                ? this.dialogOptions.filters.replace(' ', '').split('.')
                : [];
        return _.filter(filters, (filter) => availableFilters.some((avFilter) => filter.includes(avFilter)));
    }

    getLandRole = () =>
        _.get(
            JSON.parse(_.get(this.dialogOptions, 'variables.baUnit.value', '{}')),
            'responsibleOffice.correspondingRole',
        );
}
