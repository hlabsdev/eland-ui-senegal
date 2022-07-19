import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
@Component({
    selector: 'app-label',
    templateUrl: './label.component.html',
    styles: [],
})
export class LabelComponent {
    field: FieldConfig;
    group: FormGroup;
    constructor() {}
}
