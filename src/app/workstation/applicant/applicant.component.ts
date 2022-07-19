import * as _ from 'lodash';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { DataService } from '@app/data/data.service';

import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { Applicant } from '@app/core/models/applicant.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Variables } from '@app/core/models/variables.model';
import { ApplicantService } from '@app/core/services/applicant.service';
import { FormService } from '@app/core/services/form.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';

@Component({
    selector: 'app-applicant',
    template: `
        <app-applicant-form
            *ngIf="applicant && formConfig"
            [applicant]="applicant"
            [config]="formConfig"
            (cancelButtonClicked)="cancel($event)"
            [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
            (saveButtonClicked)="save($event)"
        >
        </app-applicant-form>
    `,
})
export class ApplicantComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saved = new EventEmitter<{ val: Applicant; variable: Variables }>();
    @Output() canceled = new EventEmitter<Applicant>();

    applicant: Applicant;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];

    constructor(
        protected router: Router,
        protected applicantService: ApplicantService,
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected validationService: ValidationService,
        protected utilService: UtilService,
        protected formService: FormService,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        const routeObs = this.route.params;

        routeObs
            .pipe(map((params: Params) => params['applicantId']))
            .pipe(
                switchMap((applicantId: string) => {
                    this.accessedByRouter = this.router.url.includes('applicant');
                    const applicantid = applicantId ? applicantId : this.formVariables.applicantId;
                    const applicant = this.formVariables.applicantId ? this.formVariables.applicantId : new Applicant();
                    return applicantid
                        ? this.applicantService.getApplicant(new Applicant({ id: applicantid }))
                        : of(applicant);
                }),
            )
            .subscribe(
                (applicant) => (this.applicant = new Applicant(applicant)),
                (err) => this.alertService.apiError(err),
            );

        const APPLICANT_FORM = 'APPLICANT_FORM';
        this.dataService
            .getFormByName(APPLICANT_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe((config) => {
                this.formConfig = config;
            });
    }

    save(applicant: Applicant) {
        const saveObs = applicant.id
            ? this.applicantService.updateApplicant(applicant)
            : this.applicantService.createApplicant(applicant);

        saveObs.subscribe(
            (a) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.applicant = a;
                this.saved.emit({ val: this.applicant, variable: { applicantId: { value: a.id, type: 'String' } } });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['applicants']);
        }
    }

    cancel(applicantBackup) {
        _.merge(this.applicant, applicantBackup);
        this.canceled.emit(this.applicant);
        this.goToList();
    }
}
