import { SourceComponent } from '../source.component';
import { Component, Input } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { AdministrativeSource } from '@app/core/models/administrativeSource.model';
import { FormVariables } from '../../baseForm/formVariables.model';
@Component({
    selector: 'app-administrative-source',
    templateUrl: './administrativeSource.component.html',
    providers: [{ provide: SourceComponent, useExisting: AdministrativeSourceComponent }],
})
export class AdministrativeSourceComponent extends SourceComponent {
    @Input() administrativeSource: AdministrativeSource;
    @Input() formVariables: FormVariables;
    @Input() cTypes: SelectItem[];
}
