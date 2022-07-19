import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { RRRValidationPartyRole } from './model/rrr-validation-party-role.model';
import { SelectItem } from 'primeng/api';

@Component({
    selector: 'app-rrr-validation-party-role-element',
    templateUrl: './rrr-validation-party-role-element.component.html',
})
export class RRRValidationPartyRoleElementComponent implements OnInit {
    @Input() rrrValidationPartyRole: RRRValidationPartyRole = new RRRValidationPartyRole({});

    @Output() saved = new EventEmitter<RRRValidationPartyRole>();
    @Output() canceled = new EventEmitter();

    errorMessage: string;
    partyRoles: SelectItem[];

    constructor(protected codeListService: CodeListService, protected alertService: AlertService) {}

    ngOnInit(): void {
        // ..
        this.loadPartyRoles();
    }

    loadPartyRoles() {
        const partyRoleObs$ = this.codeListService.loadCodeListOptions('PARTY_ROLE').toPromise();
        Promise.all([partyRoleObs$])
            .then((data) => {
                this.partyRoles = data[0];
            })
            .catch((err) => this.alertService.apiError(err));
    }

    cancel() {
        this.canceled.emit();
    }

    save(rrrValidationPartyRole: RRRValidationPartyRole) {
        if (!rrrValidationPartyRole.role) {
            return;
        }
        this.saved.emit(rrrValidationPartyRole);
    }
}
