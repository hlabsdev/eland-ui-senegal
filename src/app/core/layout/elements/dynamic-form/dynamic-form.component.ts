import { FieldConfig } from '@app/core/models/field.model';
import { Fraction } from '@app/core/models/fraction.model';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { ValidationService } from '@app/core/utils/validation.service';
import * as _ from 'lodash';
import { RRRTypes } from '@app/workstation/rrr/rrrType/rrrType.model';
import { RightTypes } from '@app/workstation/rrr/rightType/rightType.model';

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    exportAs: 'dynamicForm',
    selector: 'dynamic-form',
    templateUrl: './dynamic-form.component.html',
    styles: [],
})
export class DynamicFormComponent implements OnInit, OnChanges {
    @Input() fields: FieldConfig[] = [];
    @Input() title: string;
    @Input() fieldValues: any;
    @Input() saveToLadm: boolean;
    @Input() hideSaveButton: boolean;
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() submit: EventEmitter<any> = new EventEmitter<any>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Output() emitChange = new EventEmitter<boolean>();
    @Input() errorMessage: any = null;
    @Input() readOnly = false;
    @Input() rrrLeaseFormValidateFlag = true;
    @Input() noTopBar = false;
    @Input() hideActions = false;
    @Input() hideTitle = false;
    

    form: FormGroup;
    valueBackup: any = {};
    formSubmitted: boolean;
    get controls() {
        return this.fields.filter(({ type }) => type !== 'button');
    }
    get value() {
        return this.form.value;
    }

    constructor(private formBuilder: FormBuilder, public validationService: ValidationService) {}

    ngOnInit() {
        this.form = this.createGroup();
        this.formSubmitted = false;

        if (this.fieldValues) {
            this.updateValues(this.fieldValues);
        }

        if (this.readOnly) {
            this.form.disable();
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        this.errorMessage = null;

        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }

        if (this.form) {
            const controls = Object.keys(this.form.controls);
            const configControls = this.controls
                .filter((item) => item.name !== undefined && !item.disabled)
                .map((item) => item.name);
            controls
                .filter((control) => !configControls.includes(control))
                .forEach((control) => {
                    if (!_.isEmpty(this.value[control])) {
                        this.valueBackup[control] = this.value[control];
                    }
                    this.form.removeControl(control);
                });

            configControls
                .filter((control) => !controls.includes(control))
                .forEach((name) => {
                    const config = this.fields.find((control) => control.name === name && !control.disabled);
                    this.form.addControl(name, this.createControl(config));
                    this.updateValues(this.valueBackup);
                });
        }
        const changedFieldValues: SimpleChange = changes.fieldValues;
        if (changedFieldValues && changedFieldValues.currentValue) {
            this.updateValues(changedFieldValues.currentValue);
        }
    }

    updateValues(object: any) {
        if (this.form !== undefined) {
            const setObject: { [k: string]: any } = {};
            for (const key in this.form.value) {
                if (_.get(object, key)) {
                    const field = this.fields.find((item) => item.name === key);
                    if (field && field.type === 'multiInput') {
                        _.get(object, key).forEach((inputValue, index) => {
                            const formArray = this.form.controls[key] as FormArray;
                            if (typeof inputValue !== 'string') {
                                inputValue = inputValue.getMultiInputValue();
                            }
                            formArray.setControl(index, this.formBuilder.group({ value: inputValue, index }));
                        });
                    } else if (field && field.type === 'date' && typeof _.get(object, key) === 'string') {
                        setObject[key] = new Date(_.get(object, key));
                    } else {
                        setObject[key] = _.get(object, key);
                    }
                }
            }
            if (!_.isEmpty(_.pickBy(setObject))) {
                this.form.patchValue(setObject);
            }
            if (this.readOnly) {
                this.form.disable();
            }
        }
    }

    onSubmit(event: Event) {
        if(!this.hideActions)
        {
            event.preventDefault();
            event.stopPropagation();
        }
        this.formSubmitted = true;

        if (this.validateFractionInput('share')) {
            return;
        }

        if (this.validateActNumberInput(['registrationNumber', 'registrationVolume', 'registrationFolio'])) {
            return;
        }

        if (this.validateRRRTypeExtraFields()) {
            return;
        }

        // if not saving to ladm no need to validate
        if (this.saveToLadm && this.form.invalid) {
            if (this.rrrLeaseFormValidateFlag === true) {
                const errorResult = this.validationService.validateDynamicForm(this.form);
                this.validateAllFormFields(this.form);
                this.errorMessage = errorResult.toMessage();
                return;
            }
        }

        this.submit.emit(this.getFormValues());
    }

    private validateFractionInput(inputName: string) {
        if (!this.form.get(inputName) || !this.form.get(inputName).value) {
            return null;
        }
        const fraction = new Fraction(this.form.get(inputName).value);

        if (fraction.getValidationError()) {
            return (this.errorMessage = new ErrorResult(fraction.getValidationError()).toMessage());
        }

        return null;
    }

    private validateNotZeroInput(inputName: string) {
        if (this.form.get(inputName) && this.form.get(inputName).value) {
            if (Number(this.form.get(inputName).value) === 0) {
                return (this.errorMessage = new ErrorResult('MESSAGES.ZERO_NOT_ALLOWED').toMessage());
            }
        }
        return null;
    }

    private validateActNumberInput(inputNames: string[]) {
        let result = null;
        for (const inputName of inputNames) {
            result = this.validateNotZeroInput(inputName);
            if (result) {
                return result;
            }
        }
        return result;
    }

    private validateRRRTypeExtraFields() {
        const typeLeaseeNotZeroInputs = ['investmentAmount', 'annualFee', 'm2Fee'];

        const typeEmphyteuticLeaseNotZeroInputs = ['investmentAmount', 'annualFee', 'm2Fee'];

        let result = '';

        if (this.form.get('rrrType')) {
            if (this.form.get('rrrType').value === RRRTypes.RIGHT) {
                if (this.form.get('rightType') && this.form.get('rightType').value === RightTypes.LEASEHOLD) {
                    if (this.form.get('type') && this.form.get('type').value.value === 'RIGHT_TYPE_LEASE') {
                        result = this.validateTypeLeaseInputs(typeLeaseeNotZeroInputs);
                    } else if (
                        this.form.get('type') &&
                        this.form.get('type').value.value === 'RIGHT_TYPE_EMPHYTEUTIC_LEASE'
                    ) {
                        result = this.validateTypeLeaseInputs(typeEmphyteuticLeaseNotZeroInputs);
                    }
                }
            }
        }

        if (result) {
            return (this.errorMessage = new ErrorResult(result).toMessage());
        }

        return null;
    }

    private validateTypeLeaseInputs(notZeroInputs: string[]): string {
        let result = null;
        for (const inputName of notZeroInputs) {
            result = this.validateNotZeroInput(inputName);
            if (result) {
                return result.text;
            }
        }

        if (
            Number(this.form.get('contractPeriodYears').value) === 0 &&
            Number(this.form.get('contractPeriodMonths').value) === 0 &&
            this.rrrLeaseFormValidateFlag === true
        ) {
            return 'MESSAGES.SPECIFY_YEARS_OR_MONTHS';
        }

        if (
            Number(this.form.get('developmentDeadlineYears').value) === 0 &&
            Number(this.form.get('developmentDeadlineMonths').value) === 0 &&
            this.rrrLeaseFormValidateFlag === true
        ) {
            return 'MESSAGES.SPECIFY_YEARS_OR_MONTHS';
        }

        return '';
    }

    getFormValues() {
        const formValues = this.fieldValues;

        for (const key in this.value) {
            if (this.value.hasOwnProperty(key)) {
                const field = this.fields.find((item) => item.name === key);
                if (field && field.type === 'multiInput') {
                    _.set(formValues, key, this.getMultiInputValues(key, formValues));
                } else {
                    _.set(formValues, key, this.value[key]);
                }
            }
        }
        return formValues;
    }

    private getMultiInputValues(key: string, formValues: any) {
        const filedFormValues = this.value[key].map((item) => item.value);
        const filedFormIndexes = this.value[key].map((item) => item.index);
        let filedInputValues = _.get(formValues, key);
        if (_.isEmpty(filedInputValues)) {
            filedInputValues = filedFormValues;
        } else {
            filedFormIndexes.forEach((index) => {
                const value = this.value[key].find((item) => item.index === index).value;
                if (filedInputValues.length > index) {
                    if (typeof filedInputValues[index] !== 'string') {
                        filedInputValues[index].setMultiInputValue(value);
                    } else {
                        filedInputValues[index] = value;
                    }
                } else {
                    filedInputValues.push(value);
                }
            });
            filedInputValues = filedInputValues.filter((item, index) => filedFormIndexes.includes(index));
        }
        return filedInputValues;
    }

    createControl(field: FieldConfig) {
        if (!field.disabled) {
            let control;
            if (field.type === 'multiInput') {
                control = this.formBuilder.array([]);
            } else {
                control = this.formBuilder.control(field.value, this.bindValidations(field.validations || []));
            }
            return control;
        }
    }

    createGroup() {
        const group = this.formBuilder.group({});
        this.controls.forEach((control) => group.addControl(control.name, this.createControl(control)));
        return group;
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }

    bindValidations(validations: any) {
        if (validations.length > 0) {
            const validList = [];
            validations.forEach((valid) => {
                validList.push(valid.validator);
            });
            return Validators.compose(validList);
        }
        return null;
    }
    /**
     * Marks all controls in a form group as touched
     *
     * @param formGroup - The group to caress..hah
     */
    validateAllFormFields(formGroup: FormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
            const control = formGroup.get(field);
            if (control) {
                control.markAsTouched({ onlySelf: true });
            }
        });
    }
}
