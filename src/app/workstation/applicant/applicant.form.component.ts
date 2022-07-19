import { ApplicantService } from '@app/core/services/applicant.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { ValidationService } from '@app/core/utils/validation.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { Applicant } from '@app/core/models/applicant.model';
import { FieldConfig } from '@app/core/models/field.model';
import { AfterViewInit, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-applicant-form',
    template: `<dynamic-form
        [fields]="config"
        [title]="title"
        [readOnly]="readOnly"
        (submit)="submit($event)"
        [fieldValues]="fieldValues"
        (cancelButtonClicked)="cancel()"
        [saveToLadm]="true"
    ></dynamic-form>`,
})
export class ApplicantFormComponent implements AfterViewInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() applicant: Applicant = new Applicant();
    @Input() readOnly: boolean;
    @Input() config: FieldConfig[];
    @Output() saveButtonClicked = new EventEmitter<Applicant>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;

    constructor(
        protected applicantService: ApplicantService,
        protected route: ActivatedRoute,
        public validationService: ValidationService,
        public codeListService: CodeListService,
        private changeDetector: ChangeDetectorRef,
    ) {}

    ngAfterViewInit(): void {
        this.title = this.applicant.id ? 'APPLICANT.TITLE_EDIT' : 'APPLICANT.TITLE_ADD';
        this.fieldValues = this.applicant;
        this.changeDetector.detectChanges();
    }

    submit(applicant: Applicant) {
        Object.keys(applicant).forEach((key) => (this.applicant[key] = applicant[key]));
        this.saveButtonClicked.emit(this.applicant);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }
}
