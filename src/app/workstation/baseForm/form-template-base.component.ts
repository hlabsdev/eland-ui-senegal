import { Component, Output, EventEmitter } from '@angular/core';
import { FormVariables } from './formVariables.model';

@Component({
    selector: 'app-form-template-base',
    template: '',
})
export class FormTemplateBaseComponent {
    @Output() canceled = new EventEmitter<any>();
    @Output() saved = new EventEmitter<any>();
    @Output() clickedEvent = new EventEmitter<any>();

    @Output() saveButtonClicked = new EventEmitter<any>();
    @Output() cancelButtonClicked = new EventEmitter<any>();
    showLinks: boolean;
    task = null;
    type: any;
    formVariables: FormVariables;
    constructor() {}
}
