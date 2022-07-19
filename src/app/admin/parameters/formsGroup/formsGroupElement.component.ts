import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import * as _ from 'lodash';
import { DragulaService } from 'ng2-dragula';
import { TranslateService } from '@ngx-translate/core';
import { Form } from '@app/core/models/form.model';
import { FormService } from '@app/core/services/form.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import Utils from '@app/core/utils/utils';
import { FORMS } from '@app/core/utils/forms';

@Component({
    selector: 'app-params-forms-group-element',
    templateUrl: './formsGroupElement.component.html',
    styleUrls: ['formsGroupElement.component.scss'],
})
export class FormsGroupElementComponent implements OnInit {
    @Input() form: Form = new Form({});
    @Output() saved = new EventEmitter();
    @Output() canceled = new EventEmitter();

    formNames: any[];
    errorMessage: string;

    constructor(
        private formService: FormService,
        private utilService: UtilService,
        private dragulaService: DragulaService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.formNames = FORMS.GET_FORMS_LIST_OBJ();
        this.formNames.unshift({
            name: this.translateService.instant('FORMS_GROUP_ELEMENT.NO_FORM_SELECTED'),
            label: this.translateService.instant('FORMS_GROUP_ELEMENT.NO_FORM_SELECTED'),
            value: this.translateService.instant('FORMS_GROUP_ELEMENT.NO_FORM_SELECTED'),
        });
    }

    addLine() {
        this.form.childFormsArr.push(new Form({ id: Utils.uuidv4() }));
    }

    removeLine(line) {
        this.utilService.displayConfirmationDialogWithMessageParameters(
            'MESSAGES.FORMS_GROUPS.CONFIRM_DELETE_FORM',
            { formName: line.name },
            () => {
                _.remove(this.form.childFormsArr, (form) => form.id === line.id);
            },
            () => {},
        );
    }

    cancel() {
        this.canceled.emit();
    }

    save() {
        if (
            this.form.name === undefined ||
            this.form.name === null ||
            this.form.name === '' ||
            this.form.name === '_'
        ) {
            this.errorMessage = new ErrorResult('MESSAGES.FORM_GROUPS.NO_OR_INVALID_FORM_NAME').toMessage();
        } else {
            let someFailed = false;
            for (const form of this.form.childFormsArr) {
                someFailed =
                    someFailed ||
                    !form.name ||
                    form.name === this.translateService.instant('FORMS_GROUP_ELEMENT.NO_FORM_SELECTED');
            }
            if (someFailed) {
                // add error handler here
                this.errorMessage = new ErrorResult('MESSAGES.FORM_GROUPS.UNSELECTED_FORM').toMessage();
            } else {
                this.formService[this.form.id ? 'saveForm' : 'createForm'](this.form.prepareChildForms()).subscribe(
                    (result) => {
                        this.saved.emit();
                    },
                    (err) => (this.errorMessage = new ErrorResult('MESSAGES.FORM_GROUPS.SAVE_FORM_ERROR').toMessage()),
                );
            }
        }
    }

    replaceSpace() {
        this.form.name = this.form.name.replace(/ /g, '_');
    }

    checkChanged(checkChecked, obj) {
        switch (checkChecked) {
            case 'readOnly':
                obj.required = false;
                break;
            case 'required':
                obj.readOnly = false;
                break;
        }
    }
}
