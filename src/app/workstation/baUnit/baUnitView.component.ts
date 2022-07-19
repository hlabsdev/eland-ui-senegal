import { Component, Input } from '@angular/core';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { SelectItem } from 'primeng/api';

@Component({
    selector: 'app-ba-unit-view',
    templateUrl: './baUnitView.component.html',
})
export class BAUnitViewComponent {
    @Input() baUnit: BAUnit;
    @Input() options: {
        responsibleOffices?: SelectItem[];
        baUnitTypes?: SelectItem[];
        registriesItems?: SelectItem[];
        creationModes?: SelectItem[];
        baUnitRegistries?: SelectItem[];
    } = {};
}
