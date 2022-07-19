import { SelectItem } from 'primeng/api';
import { Validators } from '@angular/forms';
import * as _ from 'lodash';

export interface Validator {
    name: string;
    validator: any;
}
export class FieldConfig {
    label?: string;
    groupLabel?: string[]; // All the groups that the fields is belong to.
    name?: string;
    inputType?: string; // Input type i.e. number string. Used only in input component.
    options?: SelectItem[]; // Dropdown options for select component
    disabled?: boolean;
    properties: any; // You can pass properties through this object to elements
    optionsSearchString: string;
    collections?: any;
    type: string; // Component type i.e. date, select, input.
    click?: string;
    readOnly = false; // Use
    icon?: string;
    value?: any;
    validations?: Validator[];
    dataKey: string;
    showTime: false; // show time picker on date component
    baseSearchStringName: string;
    objectMapper: {};
    width: 12; // This manage the size of the form element in reference to col-

    constructor(obj) {
        this.type = obj.type;
        this.label = obj.label;
        this.groupLabel = obj.groupLabel;
        this.name = obj.name;
        this.inputType = obj.inputType;
        this.readOnly = obj.readOnly;
        this.click = obj.click;
        this.icon = obj.icon;
        this.options = obj.options;
        this.disabled = obj.disabled ? obj.disabled : false;
        this.optionsSearchString = obj.optionsSearchString;
        this.collections = obj.collections;
        this.value = obj.value;
        this.validations = obj.validations;
        this.properties = obj.properties;
        this.dataKey = obj.dataKey;
        this.showTime = obj.showTime;
        this.baseSearchStringName = obj.baseSearchStringName;
        this.objectMapper = obj.objectMapper;
        this.width = obj.width;
    }

    isRequired() {
        const required = this.validations.filter((val) => val.validator === Validators.required);
        return !_.isEmpty(required);
    }

    isEnabled(enabledTypes: string[]) {
        if (this.groupLabel) {
            if (this.groupLabel.some((label) => enabledTypes.includes(label))) {
                this.disabled = false;
            } else {
                this.disabled = true;
            }
        } else {
            this.disabled = true;
        }
    }
}
