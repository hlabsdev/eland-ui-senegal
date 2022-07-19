import { Component, Input } from '@angular/core';
import { FormVariables } from '../../baseForm/formVariables.model';

@Component({
    selector: 'app-rrr-picker-form',
    templateUrl: './rrrs.form.component.html',
    styleUrls: ['./rrrs.form.component.scss'],
})
export class RrrsFormComponent {
    @Input() formVariables: FormVariables = new FormVariables({});
}
