import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    OnDestroy,
} from '@angular/core';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { RRRTypes } from '@app/workstation/rrr/rrrType/rrrType.model';
import { RightTypes } from '@app/workstation/rrr/rightType/rightType.model';
import { RestrictionTypes } from '@app/workstation/rrr/restrictionType/restrictionType.model';
import { ResponsibilityTypes } from '@app/workstation/rrr/responsibilityType/responsibilityType.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { Subscription } from 'rxjs';
import { RRRValidation } from './model/rrr-validation.model';
import { DialogConfig } from '@app/core/models/dialogConfig';

@Component({
    selector: 'app-rrr-validation-form',
    templateUrl: './rrr-validation.form.component.html',
})
export class RRRValidationFormComponent implements AfterViewInit, OnDestroy {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() rrrValidationId: string;
    @Input() rrrValidation: any;
    @Input() config: FieldConfig[];
    @Input() readOnly: boolean;
    @Input() formVariables: FormVariables;
    @Input() dialogConfig: DialogConfig;

    @Output() saveButtonClicked = new EventEmitter<RRRValidation>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Output() isRolePartyChecked = new EventEmitter<boolean>();

    errorMessage: string;
    title: string;
    fieldValues: any;
    // fraction: Fraction;
    valuechanges: Subscription;

    constructor(private changeDetector: ChangeDetectorRef) {}

    ngAfterViewInit() {
        this.title = this.rrrValidation.id ? (this.readOnly ? 'RRR_VALIDATION.TITLE_VIEW' : 'RRR_VALIDATION.TITLE_EDIT') : 'RRR_VALIDATION.TITLE_ADD';


        if (this.rrrValidation.id) {
            this.config.find((item) => item.name === 'rrrType').readOnly = true;
            this.config.find((item) => item.name === 'rightType').readOnly = true;
            this.config.find((item) => item.name === 'restrictionType').readOnly = true;
            this.config.find((item) => item.name === 'responsibilityType').readOnly = true;
            this.config.filter((item) => item.name === 'type').forEach((item) => (item.readOnly = true));
        }

        this.fieldValues = this.rrrValidation;

        this.setConfigs(
            this.rrrValidation.rrrType,
            this.rrrValidation.rightType,
            this.rrrValidation.restrictionType,
            this.rrrValidation.responsibilityType,
            this.rrrValidation.type,
        );

        this.changeDetector.detectChanges();

        this.valuechanges = this.form?.form.valueChanges.subscribe((changes: any) => {
            const rrrTypeFieldChange = changes.rrrType;
            const rightFieldChange = changes.rightType;
            const restrictionFieldChange = changes.restrictionType;
            const responsibilityFieldChange = changes.responsibilityType;
            const typeFieldChange = changes.type;

            this.setConfigs(
                rrrTypeFieldChange,
                rightFieldChange,
                restrictionFieldChange,
                responsibilityFieldChange,
                typeFieldChange,
            );

            this.changeDetector.detectChanges();

            this.rrrValidation.requiresParty = changes.requiresParty;
            this.isRolePartyChecked.emit(changes?.requiresParty);
        });
    }

    ngOnDestroy(): void {
        this.valuechanges.unsubscribe();
    }

    setConfigs(rrrType, rightType = null, restrictionType = null, responsibilityType = null, type = null) {
        let enabledGroups = ['RRR'];
        if (rrrType) {
            if (rrrType === RRRTypes.RIGHT) {
                enabledGroups = ['RRR', 'RIGHT'];
                if (rightType === RightTypes.LEASEHOLD) {
                    enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD'];
                    if (type != null && type.value === 'RIGHT_TYPE_LEASE_WITH_SELL_PROMISE') {
                        enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD', 'LEASEHOLD_WITH_SALES_PROMISES'];
                    } else if (type != null && type.value === 'RIGHT_TYPE_LEASE_EMPHYTEUTIC') {
                        enabledGroups = ['RRR', 'RIGHT', 'LEASEHOLD', 'EMPHYTEUTIC_LEASEHOLD'];
                    }
                } else if (rightType === RightTypes.SUBLEASE) {
                    enabledGroups = ['RRR', 'RIGHT', 'SUB_LEASE'];
                } else if (rightType === RightTypes.OTHERS) {
                    enabledGroups = ['RRR', 'RIGHT', 'OTHERS'];
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
            enabledGroups.push('PARTY_REQUIRED');
        }

        if (type) {
            this.rrrValidation.type = type;
        }

        this.config = this.config.map((item) => {
            item.isEnabled(enabledGroups);
            return item;
        });
    }

    submit(rrrValidation: RRRValidation) {
        this.config.filter((item) => item.disabled).forEach((item) => this.rrrValidation[item.name] == null);
        Object.keys(rrrValidation).forEach((key) => (this.rrrValidation[key] = rrrValidation[key]));
        this.saveButtonClicked.emit(this.rrrValidation);
    }

    cancel() {
        this.form.form.reset();
        this.fieldValues = this.rrrValidation;

        this.setConfigs(this.rrrValidation.rrrType, this.rrrValidation.rightType, this.rrrValidation.type);

        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
    getRrrValidation(me){
        this.form.onSubmit(me);
    }
}
