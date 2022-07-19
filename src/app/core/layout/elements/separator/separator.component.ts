import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
@Component({
    selector: 'app-separator',
    template: `
        <h3 class="row no-gutters px-3 form-group" *ngIf="!field.disabled" [formGroup]="group">
            <label class="col-12 col-form-label pl-0">{{ field.label | translate }}</label>
        </h3>
    `,
})
export class SeparatorComponent {
    field: FieldConfig;
    group: FormGroup;
    constructor() {}
}
