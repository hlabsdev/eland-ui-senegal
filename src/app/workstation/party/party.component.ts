import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { Party } from '@app/core/models/party.model';
import { User } from '@app/core/models/user.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { FormService } from '@app/core/services/form.service';
import { PartyService } from '@app/core/services/party.service';
import { SelectService } from '@app/core/layout/elements/select/select.service';
import { SigtasService } from '@app/core/services/sigtas.service';
import { UserService } from '@app/core/services/user.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { Observable, of, forkJoin } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { PartyTypes } from './partyType.model';
import { map, get } from 'lodash';
import { ChangeDetectorRef } from '@angular/core';

@Component({
    selector: 'app-party',
    templateUrl: 'party.component.html',
})
export class PartyComponent implements OnInit, OnChanges {
    @Input() party: Party = new Party();
    @Input() readOnly: any = true;
    @Input() persistToDB: boolean;
    @Input() partiesUrl = false;

    @Output() saved = new EventEmitter<Party>();
    @Output() canceled = new EventEmitter<Party>();
    @Output() dataLoad = new EventEmitter<true>();
    @Input() formVariables: FormVariables = new FormVariables({});

    partyFieldReadOnly = true;
    errorMessage: string;
    accessedByRouter: boolean;
    genderIsFemale = false;

    partyTypes: SelectItem[];
    partyRoleTypes: SelectItem[];
    genders: SelectItem[];
    countries: SelectItem[];
    nationalities: SelectItem[];
    civilities: SelectItem[];
    documentTypes: SelectItem[];
    legalPersonTypes: SelectItem[];
    legalPersonRepresentativesRoles: SelectItem[];
    enterpriseTypes: SelectItem[];
    legalRepresentativesTypes: SelectItem[];

    taxPayerTypes: SelectItem[];
    partyUserSin: string;
    partyUserType: number;

    disableFutureDates: Date;
    disableFutureYears: string;
    locale: any;
    user: User;
    partyRolePrincipalPurchaser = 'PARTY_ROLE_PRINCIPAL_PURCHASER';

    constructor(
        protected route: ActivatedRoute,
        protected partyService: PartyService,
        protected alertService: AlertService,
        protected router: Router,
        protected formService: FormService,
        protected utilService: UtilService,
        protected selectService: SelectService,
        protected validationService: ValidationService,
        protected sigtasService: SigtasService,
        protected codeListService: CodeListService,
        protected translateService: TranslateService,
        protected userService: UserService,
        private ref: ChangeDetectorRef,
    ) {
        this.user = this.userService.getCurrentUser();
    }

    ngOnInit() {
        this.persistToDB = this.persistToDB ? this.persistToDB : this.party.pid != null;

        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
        this.disableFutureDates = new Date();
        this.disableFutureYears = '1900:2999';

        this.utilService
            .mapToSelectItems(this.sigtasService.getTaxPayerTypes(), '', 'value.taxPayerType')
            .subscribe((taxPayerTypes: SelectItem[]) => (this.taxPayerTypes = taxPayerTypes));

        const list: Observable<any>[] = this.codeListService.loadCodeListOptionsArray([
            'PARTY_ROLE',
            'PARTY_TYPE',
            'GENDER_TYPE',
            'COUNTRY_TYPE',
            'CIVILITY_TYPE',
            'NATIONALITY_TYPE',
            'DOCUMENT_TYPE',
            'LEGAL_PERSON_TYPE',
            'ROLE_CODE',
            'LEGAL_REPRESENTATIVE_TYPE',
        ]);

        const partyObs$ =
            this.formVariables.showCurrentVersion || !this.party.pid
                ? of(this.party)
                : this.partyService.getParty(this.party.pid);

        list.push(partyObs$);

        forkJoin(list).subscribe(
            ([
                partyRoleObs,
                partyTypesObs,
                gendersObs,
                countriesObs,
                civilitiesObs,
                nationalitiesObs,
                documentTypesObs,
                legalPersonTypesObs,
                legalPersonRepresentativesRolesObs,
                legalRepresentativesTypesObs,
                partyObs,
            ]) => {
                if (this.formVariables.validationTransaction.rrrValidationTransactions.length > 0) {
                    const indexRole = partyRoleObs[0];
                    let partyroles: any = this.formVariables.validationTransaction.rrrValidationTransactions.map(
                        (v) => v.rrrValidation.partyRoles,
                    );
                    partyroles = [].concat(...partyroles);
                    partyroles = map(partyroles, 'role');
                    partyRoleObs = partyRoleObs.filter((array) =>
                        partyroles.some((filter) => {
                            const clist = array.value;
                            if (clist) {
                                return filter.value === clist.value;
                            }
                        }),
                    );
                    partyRoleObs.unshift(indexRole);
                }

                if (this.hasPrincipalPurchaser() && !this.isPrincipalPurchaser(partyObs)) {
                    this.removePrincipalPurchaser(partyRoleObs);
                }

                this.partyRoleTypes = partyRoleObs;
                this.partyTypes = partyTypesObs;
                this.genders = gendersObs;
                this.countries = countriesObs;
                this.civilities = civilitiesObs;
                this.nationalities = nationalitiesObs;
                this.documentTypes = documentTypesObs;
                this.legalPersonTypes = legalPersonTypesObs;
                this.legalPersonRepresentativesRoles = legalPersonRepresentativesRolesObs;
                this.legalRepresentativesTypes = legalRepresentativesTypesObs;

                this.party = partyObs;
                this.getGenderType();

                this.dataLoad.emit(true);
                this.ref.markForCheck();
            },
        );
    }

    ngOnChanges(changes: SimpleChanges): void {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    save(party: Party, form: NgForm): string {
        if (this.party.partyType.value === PartyTypes.PARTY_GROUP && this.party.groupParty.partyMembers.length < 2) {
            return (this.errorMessage = new ErrorResult('MESSAGES.MISSING_GROUP_MEMBERS').toMessage());
        }

        if (form.invalid) {
            return (this.errorMessage = this.validationService.validateForm(form).toMessage());
        }

        party.modDate = new Date();
        party.modUser = this.user.username;

        if (this.partiesUrl) {
            const saveObs = party.pid ? this.partyService.updateParty(party) : this.partyService.createParty(party);

            if (this.persistToDB) {
                saveObs.subscribe(
                    (p) => {
                        this.party = p;
                        this.saved.emit(p);
                        this.saveSuccess(true);
                    },
                    (err) => this.alertService.apiError(err),
                );
            } else {
                this.saved.emit(party);
            }
        } else {
            this.saved.emit(party);
        }
    }

    cancel(): void {
        this.errorMessage = null;
        this.canceled.emit(this.party);
    }

    saveSuccess(triggerMessage = false): void {
        if (triggerMessage) {
            this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        }
        this.canceled.emit(this.party);
        this.party = null;
    }

    getGenderType(): void {
        this.genderIsFemale = get(this.party.gender, 'value') === 'GENDER_FEMALE';
    }

    resetParty(): void {
        this.party = new Party();
    }

    searchSigtasParty() {
        if (!this.partyUserSin || !this.partyUserType) {
            const ERROR_MESSAGE = 'MESSAGES.SIN_TYPE_REQUIRED';
            return (this.errorMessage = new ErrorResult(ERROR_MESSAGE).toMessage());
        }

        const result = this.validationService.validateAlpha(this.partyUserSin);
        if (result !== null) {
            return (this.errorMessage = result.toMessage());
        }

        return this.partyService.getSigtasParty(this.partyUserSin, this.partyUserType).subscribe(
            (party) => {
                this.party = party;
                if (this.partyUserType === 1) {
                    this.getGenderType();
                }
                this.ref.markForCheck();
            },
            () => {
                const ERROR_MESSAGE = 'MESSAGES.SIN_NOT_DATA_FOUND';
                this.errorMessage = new ErrorResult(ERROR_MESSAGE).toMessage();
                this.ref.markForCheck();
            },
        );
    }

    hasPrincipalPurchaser(): boolean {
        return this.formVariables.baUnit.parties.some((party) => this.isPrincipalPurchaser(party));
    }

    isPrincipalPurchaser(party: Party): boolean {
        return party.partyRoleType && party.partyRoleType.value === this.partyRolePrincipalPurchaser;
    }

    removePrincipalPurchaser(data: SelectItem[]): void {
        const partyRoleIndex = data.findIndex(
            (partyRoleType) => partyRoleType.value && partyRoleType.value.value === this.partyRolePrincipalPurchaser,
        );
        data.splice(partyRoleIndex, 1);
    }
}
