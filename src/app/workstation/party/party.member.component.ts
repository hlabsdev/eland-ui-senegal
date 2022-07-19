import { DataService } from '@app/data/data.service';
import { PartyTypes } from './partyType.model';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Party } from '@app/core/models/party.model';
import { PartyMember } from '@app/core/models/partyMember.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { FormService } from '@app/core/services/form.service';
import { PartyService } from '@app/core/services/party.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';

@Component({
    selector: 'app-party-member',
    template: ` <app-party-member-form
        *ngIf="partyMember && formConfig"
        [partyMember]="partyMember"
        [config]="formConfig"
        (cancelButtonClicked)="cancel($event)"
        (saveButtonClicked)="save($event)"
    ></app-party-member-form>`,
})
export class PartyMemberComponent implements OnInit {
    @Input() partyMember: PartyMember;
    @Output() saved = new EventEmitter<PartyMember>();
    @Output() canceled = new EventEmitter<boolean>();

    formConfig: FieldConfig[];
    partyTypesEnum = PartyTypes;
    partyTypes: SelectItem[];
    partyRoleTypes: SelectItem[];

    constructor(
        protected route: ActivatedRoute,
        protected partyService: PartyService,
        protected alertService: AlertService,
        protected codeListService: CodeListService,
        protected router: Router,
        protected formService: FormService,
        protected utilService: UtilService,
        private dataService: DataService,
    ) {}

    ngOnInit() {
        if (!this.partyMember) {
            this.partyMember = new PartyMember();
        }
        if (!this.partyMember.party) {
            this.partyMember.party = new Party();
        }
        const PARTY_FORM = 'PARTY_MEMBER_FORM';
        this.dataService
            .getFormByName(PARTY_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe((config) => {
                this.formConfig = config;
                this.getPartyMemberCodeTypes();
            });
    }

    cancel(): void {
        this.canceled.emit(true);
    }

    save(partyMember: PartyMember) {
        this.partyMember = partyMember;
        this.saved.emit(this.partyMember);
    }

    getPartyMemberCodeTypes(): void {
        this.utilService
            .mapToSelectItems(
                this.codeListService.getCodeLists({
                    type: CodeListTypes.PARTY_TYPE,
                    search: this.partyTypesEnum.PARTY_GROUP,
                    searchNotContaining: true,
                }),
                'CODELIST.VALUES',
                'value.value',
                'COMMON.ACTIONS.SELECT',
            )
            .subscribe((partyTypes: SelectItem[]) => {
                this.formConfig.find((item) => item.name === 'partyType').options = partyTypes;
            });
    }
}
