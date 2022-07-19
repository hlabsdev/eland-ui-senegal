import { Component, Input } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';

@Component({
    selector: 'app-complete',
    templateUrl: './complete.component.html',
})
export class CompleteComponent {
    errorMessage: string;
    rowSizes: any = RowSizes;
    @Input() dialogOptions: DialogOptions;
}
