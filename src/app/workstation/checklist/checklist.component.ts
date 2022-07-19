import { Component, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from '@app/core/utils/validation.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { Variables } from '@app/core/models/variables.model';
import { Checklist } from './checklist.model';
import { SelectItem } from 'primeng/api';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import * as _ from 'lodash';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { ExtendedCodelist } from './extendedCodeList.model';

@Component({
    selector: 'app-checklist',
    templateUrl: './checklist.component.html',
})
export class ChecklistComponent extends FormTemplateBaseComponent implements OnInit {
    [x: string]: any;

    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ val: Checklist[]; variable: Variables }>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    checklistItems: SelectItem[] = [];
    selectedChecklistItems: ExtendedCodelist[] = [];
    checklistToShow: Checklist;
    label: string;

    constructor(
        protected route: ActivatedRoute,
        public validationService: ValidationService,
        protected alertService: AlertService,
        public codeListService: CodeListService,
    ) {
        super();
    }

    ngOnInit() {
        if (this.formVariables.checklists && this.formVariables.checklistFormType) {
            this.checklistToShow = this.formVariables.checklists.find(
                (checklist) => _.toLower(checklist.type) === _.toLower(this.formVariables.checklistFormType),
            );

            if (this.checklistToShow) {
                this.label = ('CHECKLIST.' + this.formVariables.checklistFormType).toUpperCase();
                this.checklistItems = this.checklistToShow.items.map((item) => {
                    if (item.checked) {
                        this.selectedChecklistItems.push(item);
                    }
                    return item.toSelectItem();
                });
            }
        }
    }

    save() {
        this.formVariables.checklists
            .find((checklist) => _.toLower(checklist.type) === _.toLower(this.formVariables.checklistFormType))
            .items.forEach((codelist) => {
                if (this.selectedChecklistItems.includes(codelist)) {
                    codelist.checked = true;
                } else {
                    codelist.checked = false;
                }
            });
        this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        this.saved.emit({
            val: this.formVariables.checklists,
            variable: {
                checklists: {
                    value: JSON.stringify(this.formVariables.checklists).replace('"/g', '\\"'),
                    type: 'Json',
                },
            },
        });
    }
    cancel(): void {
        this.canceled.emit(true);
    }
}
