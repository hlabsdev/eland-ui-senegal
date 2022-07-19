import { Form } from '@app/core/models/form.model';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormService } from '@app/core/services/form.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { DragulaService } from 'ng2-dragula';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-params-forms-element',
    templateUrl: './formsElement.component.html',
    styleUrls: ['formsElement.component.scss'],
})
export class FormsElementComponent implements OnChanges {
    @Input() form: Form = new Form({});
    @Output() saved = new EventEmitter();
    @Output() canceled = new EventEmitter();

    errorMessage: string;

    constructor(
        private formService: FormService,
        private utilService: UtilService,
        private dragulaService: DragulaService,
        private translateService: TranslateService,
    ) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (this.form) {
            this.prettify(this.form.body);
        }
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
            this.errorMessage = new ErrorResult('MESSAGES.FORMS.NO_OR_INVALID_FORM_NAME').toMessage();
        } else {
            if (this.prettify()) {
                // add error handler here
                this.errorMessage = new ErrorResult('MESSAGES.FORMS.JSON_PARSE_FAILED').toMessage();
            } else {
                this.formService[this.form.id ? 'saveForm' : 'createForm'](this.form.prepareChildForms()).subscribe(
                    (result) => {
                        this.saved.emit();
                    },
                    (err) => (this.errorMessage = new ErrorResult('MESSAGES.FORMS.SAVE_FORM_ERROR').toMessage()),
                );
            }
        }
    }

    replaceSpace() {
        this.form.name = this.form.name.replace(/ /g, '_');
    }

    prettify(body?) {
        const ugly = body || this.form.bodyWrap;
        let pretty;
        let hasError = false;
        try {
            pretty = JSON.stringify(JSON.parse(ugly), undefined, 2);
        } catch (e) {
            hasError = true;
        }
        this.form.bodyWrap = pretty || ugly;
        return hasError;
    }
}
