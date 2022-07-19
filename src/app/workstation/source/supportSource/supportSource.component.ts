import { SourceComponent } from '../source.component';
import { Component, Input, OnInit } from '@angular/core';
import { SupportSource } from '@app/core/models/supportSource.model';
@Component({
    selector: 'app-support-source',
    templateUrl: './supportSource.component.html',
    providers: [{ provide: SourceComponent, useExisting: SupportSourceComponent }],
})
export class SupportSourceComponent extends SourceComponent {
    @Input() supportSource: SupportSource;
}
