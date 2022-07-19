import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DoCheck,
    EventEmitter,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
} from '@angular/core';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { Fraction } from '@app/core/models/fraction.model';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { Subscription } from 'rxjs';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { SpatialUnit } from '@app/workstation/spatialUnit/spatialUnit.model';
import { ResponsibilityTypes } from '../responsibilityType/responsibilityType.model';
import { RestrictionTypes } from '../restrictionType/restrictionType.model';
import { RightTypes } from '../rightType/rightType.model';
import { RRR } from '../rrr/rrr.model';
import { RRRTypes } from '../rrrType/rrrType.model';

@Component({
    selector: 'app-rrr-form',
    template: `
        <dynamic-form
            [fields]="config"
            [readOnly]="readOnly"
            [errorMessage]="errorMessage"
            [title]="title"
            (submit)="submit($event)"
            [fieldValues]="fieldValues"
            (cancelButtonClicked)="cancel()"
            [saveToLadm]="true"
            [rrrLeaseFormValidateFlag]="formVariables.baUnitRRRLeaseFormFieldsRequired"
        >
        </dynamic-form>

        <app-parties
            *ngIf="isRRRParty && formVariables"
            [picker]="true"
            [rrrParties]="rrr.parties"
            [filterByRRRType]="rrr.type"
            [formVariables]="formVariables"
            (partyPickerSave)="addParty($event)"
            (partyPickerDelete)="deletePartyFromRRR($event)"
        ></app-parties>

        <app-spatial-units
            *ngIf="isRRRParty && formVariables"
            [picker]="true"
            [rrrSpatialUnitsArray]="rrrSpatialUnitsArray"
            [formVariables]="formVariables"
            (spatialUnitPickerSave)="addSpatialUnitToRRR($event)"
            (spatialUnitPickerDelete)="deleteSpatialUnitFromRRR($event)"
        ></app-spatial-units>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RRRFormComponent implements AfterViewInit, OnInit, OnDestroy, DoCheck {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    @Input() rrrId: string;
    @Input() rrr: RRR = new RRR();
    @Input() config: FieldConfig[];
    @Input() readOnly = false;
    @Input() formVariables: FormVariables;
    @Output() saveButtonClicked = new EventEmitter<RRR>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Input() rrrSpatialUnitsArray: SpatialUnit[] = [];
    errorMessage: string;
    title: string;
    fieldValues: any;
    fraction: Fraction;
    isRRRParty: boolean;
    defaultSpatialUnit: SpatialUnit = new SpatialUnit();
    valuechanges: Subscription;

    constructor(
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        private alertService: AlertService,
    ) {}

    disabledSelect: SelectItem = {
        label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
        value: undefined,
    };

    ngAfterViewInit() {
        this.title = this.rrr.rid ? 'RRR.TITLE_EDIT' : 'RRR.TITLE_ADD';

        if (this.rrr.rid) {
            this.config.find((item) => item.name === 'rrrType').readOnly = true;
            this.config.find((item) => item.name === 'rightType').readOnly = true;
            this.config.find((item) => item.name === 'restrictionType').readOnly = true;
            this.config.find((item) => item.name === 'responsibilityType').readOnly = true;
            this.config.filter((item) => item.name === 'type').forEach((item) => (item.readOnly = true));
        }

        this.fieldValues = this.rrr;
        this.setConfigs(
            this.rrr.shareCheck,
            this.rrr.rrrType,
            this.rrr.rightType,
            this.rrr.restrictionType,
            this.rrr.responsibilityType,
            this.rrr.type,
        );

        this.changeDetector.detectChanges();
        this.valuechanges = this.form.form.valueChanges.subscribe((changes: any) => {
            const rrrTypeFieldChange = changes.rrrType;
            const rightFieldChange = changes.rightType;
            const restrictionFieldChange = changes.restrictionType;
            const responsibilityFieldChange = changes.responsibilityType;
            const shareCheckFieldChange = changes.shareCheck;
            const typeFieldChange = changes.type;

            this.setConfigs(
                shareCheckFieldChange,
                rrrTypeFieldChange,
                rightFieldChange,
                restrictionFieldChange,
                responsibilityFieldChange,
                typeFieldChange,
            );
            this.changeDetector.detectChanges();
        });
    }

    ngOnInit() {
        this.config.filter((item) => item.name === 'type').forEach((item) => (item.options = [this.disabledSelect]));
        this.config
            .filter((item) => item.name === 'acquisitionMode')
            .forEach((item) => (item.options = [this.disabledSelect]));

        if (this.rrr.spatialUnit && this.rrr.spatialUnit.suid) {
            this.rrrSpatialUnitsArray.push(this.rrr.spatialUnit);
            this.defaultSpatialUnit = _.cloneDeep(this.rrr.spatialUnit);
        }
    }

    ngDoCheck() {
        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        this.valuechanges.unsubscribe();
    }

    addParty(party: any) {
        const rrrWithParty = this.rrr.parties.filter((val) => val.pid === party.pid);
        if (_.isEmpty(rrrWithParty)) {
            this.rrr.parties.push(party);
        }
    }

    deletePartyFromRRR(party: any) {
        const index = _.findIndex(this.rrr.parties, party);
        if (index > -1) {
            this.rrr.parties.splice(index, 1);
        }
    }

    addSpatialUnitToRRR(spatialUnit: any) {
        this.rrr.spatialUnit = spatialUnit;
        this.rrrSpatialUnitsArray.length = 0;
        this.rrrSpatialUnitsArray.push(spatialUnit);
        this.rrrSpatialUnitsArray = [].concat(this.rrrSpatialUnitsArray);
    }

    deleteSpatialUnitFromRRR(spatialUnit: any) {
        this.rrr.spatialUnit = new SpatialUnit();
        this.rrrSpatialUnitsArray.length = 0;
    }

    setConfigs(shareCheck, rrrType, rightType = null, restrictionType = null, responsibilityType = null, type = null) {
        let enabledGroups = ['RRR'];

        if (rrrType) {
            if (rrrType === RRRTypes.RIGHT) {
                enabledGroups = ['RRR', 'RIGHT'];
                if (rightType === RightTypes.LEASEHOLD) {
                    enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD'];
                    if (type != null && type.value === 'RIGHT_TYPE_LEASE_WITH_SELL_PROMISE') {
                        enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD', 'LEASEHOLD_WITH_SALES_PROMISES'];
                        this.resetLeaseValidation();
                    } else if (type != null && type.value === 'RIGHT_TYPE_LEASE_EMPHYTEUTIC') {
                        enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD', 'EMPHYTEUTIC_LEASEHOLD'];
                        this.resetLeaseValidation();
                    } else if (
                        type != null &&
                        (type.value === 'RIGHT_TYPE_LEASE_CONCESSION' ||
                            type.value === 'RIGHT_TYPE_LEASE_TEMPORARY_OCCUPANCY')
                    ) {
                        enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD', 'CONCESSION'];
                    }
                } else if (rightType === RightTypes.SUBLEASE) {
                    enabledGroups = ['RRR', 'RIGHT', 'SUB_LEASE'];
                } else if (rightType === RightTypes.OTHERS) {
                    enabledGroups = ['RRR', 'RIGHT', 'OTHERS'];
                } else if (rightType === RightTypes.FREEHOLD) {
                    enabledGroups = ['RRR', 'RIGHT', 'FREEHOLD'];
                }
            } else if (rrrType === RRRTypes.RESTRICTION) {
                enabledGroups = ['RRR', 'RESTRICTION'];
                if (restrictionType === RestrictionTypes.MORTGAGE) {
                    enabledGroups = ['RRR', 'RESTRICTION', 'MORTGAGE'];
                } else if (restrictionType === RestrictionTypes.LINKED_TO_MORTGAGE) {
                    enabledGroups = ['RRR', 'RESTRICTION', 'LINKED_TO_MORTGAGE'];
                } else if (restrictionType === RestrictionTypes.MONETARY) {
                    enabledGroups = ['RRR', 'RESTRICTION', 'MONETARY'];
                } else if (restrictionType === RestrictionTypes.OTHERS) {
                    enabledGroups = ['RRR', 'RESTRICTION', 'OTHERS'];
                }
            } else if (rrrType === RRRTypes.RESPONSIBILITY) {
                enabledGroups = ['RRR', 'RESPONSIBILITY'];
                if (responsibilityType === ResponsibilityTypes.MONETARY) {
                    enabledGroups = ['RRR', 'RESPONSIBILITY', 'MONETARY'];
                } else if (responsibilityType === ResponsibilityTypes.OTHERS) {
                    enabledGroups = ['RRR', 'RESPONSIBILITY', 'OTHERS'];
                }
            }
        }

        if (type) {
            this.rrr.type = type;
            this.isRRRParty = true;
        } else {
            this.isRRRParty = false;
        }

        if (shareCheck) {
            enabledGroups.push('SHARE');
        }

        this.config = this.config.map((item) => {
            item.isEnabled(enabledGroups);
            return item;
        });
    }

    submit(rrr: RRR) {
        const validationPartyRoles = this.getRRRValidationPartyRoles(rrr);
        const partyRoleTypeValues = _.map(rrr.parties, 'partyRoleType.value');
        const filterPartyRoles = _.filter(validationPartyRoles, (v) => _.includes(partyRoleTypeValues, v));
        if (filterPartyRoles.length === 0 && validationPartyRoles.length > 0) {
            validationPartyRoles.forEach(
                (item, i) => (validationPartyRoles[i] = this.translateService.instant('CODELIST.VALUES.' + item)),
            );
            this.errorMessage = new ErrorResult('RRR_VALIDATION.MESSAGES.ERROR_PARTY_REQUIRED', {
                rrrType: this.translateService.instant('RRR.TYPES.' + rrr.rrrType),
                partyRole: validationPartyRoles.join(', '),
            }).toMessage();
            return;
        }

        this.config.filter((item) => item.disabled).forEach((item) => this.rrr[item.name] == null);
        Object.keys(rrr).forEach((key) => (this.rrr[key] = rrr[key]));
        this.saveButtonClicked.emit(this.rrr);
    }

    cancel() {
        this.form.form.reset();
        this.fieldValues = this.rrr;
        this.setConfigs(this.rrr.shareCheck, this.rrr.rrrType, this.rrr.type);
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
        this.rrr.spatialUnit = this.defaultSpatialUnit;
    }

    private resetLeaseValidation() {
        if (this.formVariables.baUnitRRRLeaseFormFieldsRequired === false) {
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.PREAMBLE').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.CONTRACT_TERMS').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.CONTRACTUAL_OBJECT').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.INVESTMENT_AMOUNT').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.CONTRACT_PERIOD.YEARS').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.CONTRACT_PERIOD.MONTHS').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.DEVELOPMENT_PERIOD.YEARS').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.DEVELOPMENT_PERIOD.MONTHS').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.ANNUAL_FEE').validations = [];
            this.config.find((obj) => obj.label === 'RRR.LEASEHOLD.M2_FEE').validations = [];
        }
    }

    private getRRRValidationPartyRoles(rrr: RRR) {
        let partyroles: any = this.formVariables.validationTransaction.rrrValidationTransactions.filter(
            (item) => item.rrrValidation.type.value === rrr.type.value,
        );
        partyroles = _.map(partyroles, 'rrrValidation.partyRoles');
        partyroles = [].concat(...partyroles);
        partyroles = partyroles.filter((item) => item.required === true);
        partyroles = _.map(partyroles, 'role');
        partyroles = _.map(partyroles, 'value');

        return partyroles;
    }
}
