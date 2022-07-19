import { Component, Input, OnInit } from '@angular/core';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import { TranslateService } from '@ngx-translate/core';

interface SelectItemDialogOptions {
    label: string;
    value: string;
    identifier: string;
}
@Component({
    selector: 'app-choice-options',
    templateUrl: './choice-options.component.html',
})
export class ChoiceOptionsComponent implements OnInit {
    errorMessage: string;
    @Input() dialogOptions: DialogOptions;
    dialogOptionsDropdown: SelectItemDialogOptions[];
    radioButtonMode: boolean;
    dropDownMode: boolean;

    constructor(protected translateService: TranslateService) {}

    ngOnInit() {
        this.dialogOptionsDropdown = this.dialogOptions.options.map((_option: string) => ({
            label: _option,
            value: _option,
            identifier: this.dialogOptions.identifier,
        }));
        this.dialogOptionsDropdown.forEach((opt) => {
            this.translateService
                .get(`TASK.MULTIPLE_CHOICES.${opt.identifier}.${opt.label}`)
                .subscribe((label) => (opt.label = label));
        });
        this.radioButtonMode = this.dialogOptions.options.length <= 3;
        this.dropDownMode = this.dialogOptions.options.length > 3;
    }
}
