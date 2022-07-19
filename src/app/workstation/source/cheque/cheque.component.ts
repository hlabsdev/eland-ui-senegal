import { SourceComponent } from '../source.component';
import { Component, Input } from '@angular/core';
import { Cheque } from '@app/core/models/cheque.model';

@Component({
    selector: 'app-cheque',
    templateUrl: './cheque.component.html',
    providers: [{ provide: SourceComponent, useExisting: ChequeComponent }],
})
export class ChequeComponent extends SourceComponent {
    @Input() cheque: Cheque;
}
