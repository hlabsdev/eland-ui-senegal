import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';

@Component({
    selector: 'app-button',
    templateUrl: './button.component.html',
    styles: [],
})
export class ButtonComponent {
    field: FieldConfig;
    group: FormGroup;
    constructor() {}
}
