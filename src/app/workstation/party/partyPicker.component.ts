import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfigService } from '@app/core/app-config/config.service';
import { Party } from '@app/core/models/party.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { PartyService } from '@app/core/services/party.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

@Component({
    selector: 'app-party-picker',
    templateUrl: './partyPicker.component.html',
})
export class PartyPickerComponent extends FormTemplateBaseComponent implements OnInit, OnChanges {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() filterByRRRType: any;
    @Output() saved = new EventEmitter<Party>();
    @Output() canceled = new EventEmitter<Party>();
    party: Party;
    parties: Party[];
    rowSizes: any = RowSizes;
    cols: any[];

    constructor(
        protected route: ActivatedRoute,
        protected translateService: TranslateService,
        protected partyService: PartyService,
        protected configService: ConfigService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.loadParties();

        this.cols = [
            { field: 'pid', header: this.translateService.instant('PARTY.ID'), width: '10%' },
            { field: 'party', header: this.translateService.instant('PARTY.NAME'), width: '20%' },
            { field: 'partyRoleType', header: this.translateService.instant('PARTY.ROLES'), width: '20%' },
            { field: 'inscriptionDate', header: this.translateService.instant('PARTY.INSCRIPTION_DATE'), width: '20%' },
            { field: 'modDate', header: this.translateService.instant('PARTY.MOD_DATE'), width: '20%' },
        ];
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes.filterByRRRType) {
            this.loadParties();
        }
    }

    loadParties(): void {
        if (
            this.filterByRRRType &&
            this.formVariables.validationTransaction &&
            this.formVariables.validationTransaction.rrrValidationTransactions.length > 0
        ) {
            const partyRolesAllowedByRRRType = this.formVariables.validationTransaction.getPartyRolesValuesByRRRType(
                this.filterByRRRType.value,
            );

            this.parties = this.formVariables.baUnit.parties
                .filter((item) => item.pid !== undefined && item.radiationDate === null)
                .filter((item) => item.isAllowed(partyRolesAllowedByRRRType));
        } else {
            this.parties = this.formVariables.baUnit.parties.filter(
                (item) => item.pid !== undefined && item.radiationDate === null,
            );
        }

        this.parties.forEach((party) => {
            party['role'] = this.translateService.instant('CODELIST.VALUES.' + party.partyRoleType.value);
            party['name'] = party.getName();
        });
        this.parties = _.sortBy(this.parties, ['role', 'name'], ['asc', 'asc']);
    }

    save(party: Party) {
        this.saved.emit(party);
    }

    cancel(): void {
        this.canceled.emit(this.party);
    }
}
