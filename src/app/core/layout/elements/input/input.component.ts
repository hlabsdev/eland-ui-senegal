import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
@Component({
    selector: 'app-input',
    templateUrl: './input.component.html',
    styles: [],
})
export class InputComponent {
    field: FieldConfig;
    group: FormGroup;
    constructor() {}
}
