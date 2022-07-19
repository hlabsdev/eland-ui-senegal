import { Component, Input, OnChanges } from '@angular/core';
import { ConsistencyChange } from '../../../core/models/consistencyChange.model';

@Component({
    selector: 'app-cc-item',
    templateUrl: 'consistencyChangeItem.component.html',
    styleUrls: ['consistencyChangeItem.component.scss'],
})
export class ConsistencyChangeItemComponent {
    @Input() cci: ConsistencyChange;
}
