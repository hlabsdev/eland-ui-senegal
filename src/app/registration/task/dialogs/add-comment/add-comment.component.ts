import { Component, Input } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';

@Component({
    selector: 'app-add-comment',
    templateUrl: './add-comment.component.html',
})
export class AddCommentComponent {
    rowSizes: any = RowSizes;
    @Input() dialogOptions: DialogOptions;
}
