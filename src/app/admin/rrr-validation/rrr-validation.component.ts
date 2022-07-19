import { map, mergeMap } from 'rxjs/operators';
import { Component, OnInit, Input, Output, EventEmitter, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Dialog } from 'primeng/dialog';
import { of, forkJoin, Subscription } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { SelectService } from '@app/core/layout/elements/select/select.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { FormService } from '@app/core/services/form.service';
import { Fraction } from '@app/core/models/fraction.model';
import { FieldConfig } from '@app/core/models/field.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { RRRService } from '@app/workstation/rrr/rrr/rrr.service';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { RRRValidation } from './model/rrr-validation.model';
import { RRRValidationService } from './service/rrr-validation.service';
import { DialogConfig } from '@app/core/models/dialogConfig';
import { RRRValidationFormComponent } from './rrr-validation.form.component';
import { RRRValidationPartyRolesComponent } from './rrr-validation-party-roles.component';

@Component({
    selector: 'app-rrr-validation',
    templateUrl: './rrr-validation.component.html',
})
export class RRRValidationComponent implements OnInit, OnDestroy {
    @Input() rrrValidation: RRRValidation = new RRRValidation({});
    @Input() baUnit: BAUnit;
    @Input() persistToDB: boolean;
    @Input() readOnly: boolean;
    @Input() formVariables: FormVariables;
    @Input() rrrValidationsUrl: boolean;
    @Input() dialogConfig: DialogConfig;

    @Output() saved = new EventEmitter<RRRValidation>();
    @Output() canceled = new EventEmitter<RRRValidation>();
    @Output() dataLoad = new EventEmitter<true>();

    @ViewChild('dd') tabs: Dialog;
    @ViewChild(RRRValidationFormComponent) RRRValidationFormComp:RRRValidationFormComponent;
    @ViewChild(RRRValidationPartyRolesComponent) RRRValidationPartyRolesComp:RRRValidationPartyRolesComponent;


    formConfig: FieldConfig[];
    fraction: Fraction;
    subscription: Subscription;

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
        protected rrrValidationService: RRRValidationService,
    ) {
        this.subscription = this.selectService.select$.subscribe((data: any) => {
            if (data && data.name === 'rightType') {
                this.getRRRValidationType('RIGHT_' + data.value);
            }

            if (data && data.name === 'restrictionType') {
                this.getRRRValidationType('RESTRICTION_' + data.value);
            }

            if (data && data.name === 'responsibilityType') {
                this.getRRRValidationType('RESPONSIBILITY_' + data.value);
            }
        });
    }

    ngOnInit() {
        this.persistToDB = this.persistToDB ? this.persistToDB : this.rrrValidation.id != null;

        const rrrValidationObs =
            this.formVariables.showCurrentVersion || !this.rrrValidation.id
                ? of(this.rrrValidation)
                : this.rrrValidationService.getRRRValidation(this.rrrValidation);

        const RRR_VALIDATION_FORM = 'RRR_VALIDATION_FORM';

        this.formService
            .getFormByName(RRR_VALIDATION_FORM)
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
                rrrValidationObs.subscribe(
                    (r) => {
                        this.rrrValidation = r;

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
                                default:
                                    break;
                            }
                            return val;
                        });

                        if (this.rrrValidation.id) {
                            if (this.rrrValidation.rightType) {
                                this.getRRRValidationType(
                                    `${this.rrrValidation.rrrType}_${this.rrrValidation.rightType}`,
                                );
                            } else if (this.rrrValidation.restrictionType) {
                                this.getRRRValidationType(
                                    `${this.rrrValidation.rrrType}_${this.rrrValidation.restrictionType}`,
                                );
                            } else if (this.rrrValidation.responsibilityType) {
                                this.getRRRValidationType(
                                    `${this.rrrValidation.rrrType}_${this.rrrValidation.responsibilityType}`,
                                );
                            }
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

    save(rrrValidation: RRRValidation) {
        if (this.rrrValidationsUrl) {
            const saveObs = rrrValidation.id
                ? this.rrrValidationService.updateRRRValidation(rrrValidation)
                : this.rrrValidationService.createRRRValidation(rrrValidation);

            if (this.persistToDB) {
                saveObs.subscribe(
                    (r) => {
                        this.rrrValidation = r;
                        this.saved.emit(r);
                        this.saveSuccess(true);
                    },
                    (err) => this.alertService.apiError(err),
                );
            } else {
                this.saved.emit(rrrValidation);
            }
        } else {
            this.saved.emit(rrrValidation);
        }
    }

    saveSuccess(triggerMessage = false): void {
        if (triggerMessage) {
            this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        }
        this.canceled.emit(this.rrrValidation);
        this.rrrValidation = null;
    }

    getRRRValidationType(codelistType: string) {
        this.codeListService.loadCodeListOptions(codelistType).subscribe((val) => {
            this.formConfig.filter((item) => item.name === 'type').forEach((item) => (item.options = val));
        });
    }
    next(activeTab: number){
        console.log(activeTab);
        this.dialogConfig.tabs[activeTab].warning = false; // unlock tab
        this.dialogConfig.canSave = true; //enable save
    }

    previous = (activeTab: number) => console.log(activeTab);

    saveRRR = (event) => {
        this.RRRValidationFormComp.getRrrValidation(event);
        console.log('save');
        this.dialogConfig.display = false;
    };
}
