import { DataService } from '@app/data/data.service';
import { RRR } from './rrr.model';
import { map, mergeMap } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { of, forkJoin, Subscription } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { RRRService } from './rrr.service';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { CodeList } from '@app/core/models/codeList.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Fraction } from '@app/core/models/fraction.model';
import { User } from '@app/core/models/user.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { FormService } from '@app/core/services/form.service';
import { SelectService } from '@app/core/layout/elements/select/select.service';
import { UserService } from '@app/core/services/user.service';
import { UtilService } from '@app/core/utils/util.service';
import { TranslateService } from '@ngx-translate/core';
import { isNull, filter, includes } from 'lodash';

@Component({
    selector: 'app-rrr',
    template: ` <app-rrr-form
        *ngIf="rrr && formConfig"
        [readOnly]="readOnly"
        [formVariables]="formVariables"
        [rrr]="rrr"
        [config]="formConfig"
        (cancelButtonClicked)="canceled.emit($event)"
        (saveButtonClicked)="save($event)"
    >
    </app-rrr-form>`,
})
export class RRRComponent implements OnInit, OnDestroy {
    @Input() rrr: RRR = new RRR();
    @Input() baUnit: BAUnit;
    @Input() persistToDB: boolean;
    @Input() readOnly = false;
    @Input() formVariables: FormVariables;
    @Input() radiate = false;

    @Input() rrrsUrl = false;
    @Output() saved = new EventEmitter<RRR>();
    @Output() canceled = new EventEmitter<RRR>();
    @Output() dataLoad = new EventEmitter<true>();

    formConfig: FieldConfig[];
    fraction: Fraction;
    subscription: Subscription;
    user: User;

    constructor(
        protected route: ActivatedRoute,
        protected rrrService: RRRService,
        protected alertService: AlertService,
        protected router: Router,
        protected formService: FormService,
        protected utilService: UtilService,
        protected baUnitService: BAUnitService,
        protected selectService: SelectService,
        protected codeListService: CodeListService,
        protected userService: UserService,
        private dataService: DataService,
        private translateService: TranslateService,
    ) {
        this.user = this.userService.getCurrentUser();

        this.subscription = this.selectService.select$.subscribe((data: any) => {
            if (data && data.name === 'rrrType') {
                this.formConfig
                    .filter((item) => item.name === 'rightType')
                    .forEach((item) => (item.value = this.disabledSelect));
                this.formConfig
                    .filter((item) => item.name === 'restrictionType')
                    .forEach((item) => (item.value = this.disabledSelect));
                this.formConfig
                    .filter((item) => item.name === 'responsibilityType')
                    .forEach((item) => (item.value = this.disabledSelect));
                this.formConfig
                    .filter((item) => item.name === 'type')
                    .forEach((item) => (item.options = [this.disabledSelect]));
            }

            if (data && data.name === 'rightType') {
                this.getRRRType('RIGHT_' + data.value, data.name);
            }

            if (data && data.name === 'restrictionType') {
                this.getRRRType('RESTRICTION_' + data.value, data.name);
            }

            if (data && data.name === 'responsibilityType') {
                this.getRRRType('RESPONSIBILITY_' + data.value, data.name);
            }

            if (data && data.name === 'type') {
                this.getRigthAcquisitionModes(data.value);
            }
        });
    }

    displayDialog: boolean;

    disabledSelect: SelectItem = {
        label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
        value: undefined,
    };

    ngOnInit() {
        this.persistToDB = this.persistToDB ? this.persistToDB : this.rrr.rid != null;
        const rrrObs =
            this.formVariables.showCurrentVersion || !this.rrr.rid
                ? of(this.rrr)
                : this.rrrService.getRRR(this.rrr.rid);
        const RRR_FORM = 'RRR_FORM';

        this.dataService
            .getFormByName(RRR_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .pipe(
                mergeMap((config: any) =>
                    forkJoin([
                        this.utilService.mapToSelectItems(
                            this.rrrService.getRRRTypes(),
                            'RRR.TYPES',
                            'value',
                            'COMMON.ACTIONS.SELECT',
                        ),
                        this.utilService.mapToSelectItems(
                            this.rrrService.getRightSubTypes(),
                            'RRR.RIGHT_TYPES',
                            'value',
                            'COMMON.ACTIONS.SELECT',
                        ),
                        this.utilService.mapToSelectItems(this.baUnitService.getMortgageAssociableRights(this.baUnit)),
                        this.utilService.mapToSelectItems(
                            this.rrrService.getRestrictionSubTypes(),
                            'RRR.RESTRICTION_TYPES',
                            'value',
                            'COMMON.ACTIONS.SELECT',
                        ),
                        this.utilService.mapToSelectItems(
                            this.rrrService.getResponsibilitySubTypes(),
                            'RRR.RESPONSIBILITY_TYPES',
                            'value',
                            'COMMON.ACTIONS.SELECT',
                        ),
                    ]).pipe(
                        map((data) => ({
                            config,
                            rrrTypes: data[0],
                            rightTypes: data[1],
                            rrrs: data[2],
                            restrictionTypes: data[3],
                            responsibilityTypes: data[4],
                        })),
                    ),
                ),
            )
            .subscribe(({ config, rrrTypes, rightTypes, rrrs, restrictionTypes, responsibilityTypes }) =>
                rrrObs.subscribe(
                    (r) => {
                        this.rrr = r;

                        if (
                            this.formVariables.validationTransaction &&
                            this.formVariables.validationTransaction.rrrValidationTransactions.length > 0
                        ) {
                            const indexSelect = rrrTypes[0];
                            const rrrTypesVal = this.formVariables.validationTransaction.rrrValidationTransactions.map(
                                (v) => v.rrrValidation.rrrType,
                            );
                            rrrTypes = filter(rrrTypes, (v) => includes(rrrTypesVal, v.value));
                            rrrTypes.unshift(indexSelect);

                            const rightTypesVal = this.formVariables.validationTransaction.rrrValidationTransactions
                                .filter((v) => !isNull(v.rrrValidation.rightType))
                                .map((v) => v.rrrValidation.rightType);
                            rightTypes = filter(rightTypes, (v) => includes(rightTypesVal, v.value));
                            if (rightTypes[0] !== indexSelect) {
                                rightTypes.unshift(indexSelect);
                            }

                            const restrictionTypesVal =
                                this.formVariables.validationTransaction.rrrValidationTransactions
                                    .filter((v) => !isNull(v.rrrValidation.restrictionType))
                                    .map((v) => v.rrrValidation.restrictionType);
                            if (restrictionTypesVal[0] !== null) {
                                restrictionTypes = filter(restrictionTypes, (v) =>
                                    includes(restrictionTypesVal, v.value),
                                );
                                if (restrictionTypes[0] !== indexSelect) {
                                    restrictionTypes.unshift(indexSelect);
                                }
                            }
                        }

                        config.forEach((val) => {
                            switch (val.label) {
                                case 'RRR.RIGHT.TYPE':
                                    val.options = rightTypes;
                                    break;
                                case 'RRR.RESTRICTION.TYPE':
                                    val.options = restrictionTypes;
                                    break;
                                case 'RRR.RESPONSIBILITY.TYPE':
                                    val.options = responsibilityTypes;
                                    break;
                                case 'RRR.RRR_TYPE':
                                    val.options = rrrTypes;
                                    break;
                                case 'RRR.MORTGAGE.RIGHT':
                                    val.options = rrrs;
                                    break;
                                case 'RRR.RADIATION_DATE':
                                    val.readOnly = !this.radiate;
                                    break;
                                case 'RRR.RADIATION_NUMBER':
                                    if (this.radiate) {
                                        val.value = (this.baUnit.slipNumber + 1).toString();
                                    }
                                    break;
                                default:
                                    break;
                            }
                            return val;
                        });

                        if (this.rrr.rid) {
                            if (this.rrr.rightType) {
                                this.getRRRType(`${this.rrr.rrrType}_${this.rrr.rightType}`, 'rightType');
                                this.getRigthAcquisitionModes(this.rrr.type);
                            } else if (this.rrr.restrictionType) {
                                this.getRRRType(`${this.rrr.rrrType}_${this.rrr.restrictionType}`, 'restrictionType');
                            } else if (this.rrr.responsibilityType) {
                                this.getRRRType(
                                    `${this.rrr.rrrType}_${this.rrr.responsibilityType}`,
                                    'responsibilityType',
                                );
                            }
                        }

                        if (!this.rrr.rid) {
                            this.rrr.inscriptionTransactionId = (this.baUnit.slipNumber + 1).toString();
                        }

                        if (this.radiate) {
                            this.rrr.radiationTransactionId = (this.baUnit.slipNumber + 1).toString();
                        }

                        this.formConfig = config;
                        this.dataLoad.emit(true);
                    },
                    (err) => this.alertService.apiError(err),
                ),
            );
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    save(rrr: RRR) {
        rrr.modDate = new Date();
        rrr.modUser = this.user.username;

        if (this.radiate) {
            rrr.parties.forEach((party) => {
                party.radiationDate = rrr.radiationDate;
                this.baUnit.parties.find((p) => p.pid === party.pid).radiationDate = rrr.radiationDate;
            });
        }

        if (this.rrrsUrl) {
            const saveObs = rrr.rid ? this.rrrService.updateRRR(rrr) : this.rrrService.createRRR(rrr);

            if (this.persistToDB) {
                saveObs.subscribe(
                    (r) => {
                        this.rrr = r;
                        this.saved.emit(r);
                        this.saveSuccess(true);
                    },
                    (err) => this.alertService.apiError(err),
                );
            } else {
                this.saved.emit(rrr);
            }
        } else {
            this.saved.emit(rrr);
        }
    }

    saveSuccess(triggerMessage = false): void {
        if (triggerMessage) {
            this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        }
        this.canceled.emit(this.rrr);
        this.rrr = null;
    }

    getRRRType(codelistType: string, subType: string) {
        if (this.formConfig) {
            this.formConfig
                .filter((item) => item.name === 'type')
                .forEach((item) => (item.options = [this.disabledSelect]));
        }

        this.codeListService.loadCodeListOptions(codelistType).subscribe((val) => {
            if (
                this.formVariables.validationTransaction &&
                this.formVariables.validationTransaction.rrrValidationTransactions.length > 0
            ) {
                let allowedTypesVal = [];
                if ('rightType' === subType) {
                    allowedTypesVal = this.formVariables.validationTransaction.rrrValidationTransactions
                        .filter((v) => !isNull(v.rrrValidation.rightType) && v.rrrValidation.type.type === codelistType)
                        .map((v) => v.rrrValidation.type.value);
                } else if ('restrictionType' === subType) {
                    allowedTypesVal = this.formVariables.validationTransaction.rrrValidationTransactions
                        .filter(
                            (v) =>
                                !isNull(v.rrrValidation.restrictionType) && v.rrrValidation.type.type === codelistType,
                        )
                        .map((v) => v.rrrValidation.type.value);
                } else if ('responsibilityType' === subType) {
                    allowedTypesVal = this.formVariables.validationTransaction.rrrValidationTransactions
                        .filter(
                            (v) =>
                                !isNull(v.rrrValidation.responsibilityType) &&
                                v.rrrValidation.type.type === codelistType,
                        )
                        .map((v) => v.rrrValidation.type.value);
                }

                val = filter(val, (v) => isNull(v.value) || includes(allowedTypesVal, v.value.value));
            }

            this.formConfig.filter((item) => item.name === 'type').forEach((item) => (item.options = val));
        });
    }

    getRigthAcquisitionModes(codelistType: CodeList) {
        let acquisitionModeType = '';

        if (this.formConfig) {
            this.formConfig
                .filter((item) => item.name === 'acquisitionMode')
                .forEach((item) => (item.options = [this.disabledSelect]));
        }

        if (codelistType.value === 'RIGHT_TYPE_OWNERSHIP') {
            acquisitionModeType = 'FREEHOLD_ACQUISITION_MODE';
        } else if (
            codelistType.value === 'RIGHT_TYPE_LEASE_CONCESSION' ||
            codelistType.value === 'RRIGHT_TYPE_LEASE_TEMPORARY_OCCUPANCY'
        ) {
            acquisitionModeType = 'CONCESSION_ACQUISITION_MODE';
        }

        if (acquisitionModeType) {
            this.codeListService.loadCodeListOptions(acquisitionModeType).subscribe((val) => {
                this.formConfig
                    .filter((item) => item.name === 'acquisitionMode')
                    .forEach((item) => (item.options = val));
            });
        }
    }
}
