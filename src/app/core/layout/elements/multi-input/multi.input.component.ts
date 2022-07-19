import { Component, OnChanges } from '@angular/core';
import { FieldConfig } from '@app/core/models/field.model';
import { MultiInput } from '@app/core/interfaces/multiInput.interface';
import { FormGroup, FormArray, FormBuilder } from '@angular/forms';
import * as _ from 'lodash';

@Component({
    selector: 'app-multi-input',
    templateUrl: './multi.input.component.html',
    styles: [],
})
export class MultiInputComponent implements OnChanges {
    field: FieldConfig;
    group: FormGroup;
    readOnly: boolean;
    values: MultiInput[] = [];
    constructor(private fb: FormBuilder) {}

    ngOnChanges(): void {
        this.values = _.get(this.group.value, this.field.name);
    }
    get inputFields() {
        return this.group.get(this.field.name) as FormArray;
    }
    get inputFieldValues() {
        return this.group.get(this.field.name).value;
    }

    addInputFields(inputValue = '') {
        let lastIndex = 0;
        if (!_.isEmpty(this.inputFieldValues)) {
            lastIndex = this.inputFieldValues[this.inputFieldValues.length - 1].index + 1;
        }
        this.inputFields.push(this.fb.group({ value: inputValue, index: lastIndex }));
    }

    deleteInputFields(index) {
        this.inputFields.removeAt(index);
    }
}
