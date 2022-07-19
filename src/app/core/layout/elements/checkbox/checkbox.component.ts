import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
import { CodeListService } from '@app/core/services/codeList.service';

@Component({
    selector: 'app-checkbox',
    templateUrl: './checkbox.component.html',
})
export class CheckboxComponent implements OnInit {
    field: FieldConfig;
    group: FormGroup;

    constructor(private utilService: CodeListService) {}

    ngOnInit() {
        if (this.field.optionsSearchString) {
            this.utilService.loadCodeListOptions(this.field.optionsSearchString).subscribe((values) => {
                this.field.options = values;
            });
        }
    }
}
