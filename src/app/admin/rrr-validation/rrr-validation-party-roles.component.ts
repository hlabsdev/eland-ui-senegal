import { TranslateService } from '@ngx-translate/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { RRRValidationPartyRole } from './model/rrr-validation-party-role.model';
import { Component, Input, OnInit } from '@angular/core';
import Utils from '@app/core/utils/utils';
import * as _ from 'lodash';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';

@Component({
    selector: 'app-rrr-validation-party-roles',
    templateUrl: './rrr-validation-party-roles.component.html',
})
export class RRRValidationPartyRolesComponent implements OnInit {
    @Input() rrrValidation: RRRValidation;
    @Input() readOnly: boolean;

    rowSizes: any = RowSizes;
    rrrValidationPartyRole: any = null;
    cols: any[];
    errorMessage: string;

    constructor(
        private translateService: TranslateService,
        private utilService: UtilService,
        private alertService: AlertService, // private rrrValidationService: RRRValidationService
    ) {}

    ngOnInit(): void {
        this.loadPartyRoles();
        this.showRRRValidationPartyRoleElementDialogue();
        this.cols = [
            { field: 'role', header: this.translateService.instant('RRR_VALIDATION.PARTY_ROLE.ROLE') },
            { field: 'required', header: this.translateService.instant('RRR_VALIDATION.PARTY_ROLE.REQUIRED') },
        ];
    }

    loadPartyRoles() {
        this.rrrValidation.partyRoles.forEach((val) => (val.id = Utils.uuidv4()));
    }

    showRRRValidationPartyRoleElementDialogue(
        rrrValidationPartyRole: RRRValidationPartyRole = new RRRValidationPartyRole({}),
    ): void {
        this.rrrValidationPartyRole = rrrValidationPartyRole;
    }

    saveRRRValidationPartyRole(rrrValidationPartyRole) {
        if (!rrrValidationPartyRole.id) {
            rrrValidationPartyRole.id = Utils.uuidv4();
            this.rrrValidation.partyRoles.push(rrrValidationPartyRole);
        } else {
            _.remove(this.rrrValidation.partyRoles, (pr) => pr.id === rrrValidationPartyRole.id);
            this.rrrValidation.partyRoles.push(rrrValidationPartyRole);
        }

        this.alertService.success('RRR_VALIDATION.MESSAGES.SAVE_SUCCESS');
        this.rrrValidationPartyRole = null;
        this.showRRRValidationPartyRoleElementDialogue();
    }

    canceled() {
        this.rrrValidationPartyRole = null;
    }

    removeRRRValidationPartyRole(rrrValidationPartyRole) {
        this.utilService.displayConfirmationDialogWithMessageParameters(
            'RRR_VALIDATION.MESSAGES.CONFIRM_DELETE',
            { rrrValidationPartyRole: rrrValidationPartyRole.role.value },
            () => {
                _.remove(this.rrrValidation.partyRoles, (pr) => pr.id === rrrValidationPartyRole.id);
                this.alertService.success('RRR_VALIDATION.MESSAGES.DELETE_SUCCESS');
            },
            () => {},
        );
    }
}
