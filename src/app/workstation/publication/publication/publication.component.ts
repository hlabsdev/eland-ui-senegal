import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { map } from 'rxjs/operators';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

import { ViewChild } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { Publication } from '@app/core/models/publication.model';
import { Variables } from '@app/core/models/variables.model';
import { FormService } from '@app/core/services/form.service';
import { PublicationService } from '@app/core/services/publication.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';

@Component({
    selector: 'app-publication',
    template: `<dynamic-form
            *ngIf="this.isPublication"
            [fields]="formConfig"
            [title]="title"
            [readOnly]="readOnly"
            [fieldValues]="fieldValues"
            [saveToLadm]="true"
            (submit)="submit($event)"
            (cancelButtonClicked)="cancel()"
        ></dynamic-form>
        <core-alert *ngIf="this.errorMessage" [local]="true" [message]="errorMessage"></core-alert>`,
})
export class PublicationComponent implements OnInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() publicationUrl = false;
    @Input() persistToDB: boolean;
    @Input() publication: Publication;
    @Input() readOnly: boolean;
    @Input() formVariables: FormVariables;

    @Output() saved = new EventEmitter<{ val: Publication; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    accessedByRouter: boolean;
    formConfig: FieldConfig[];

    title: string;
    fieldValues: any;
    errorMessage: string;
    isPublication = false;

    constructor(
        protected router: Router,
        protected publicationService: PublicationService,
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected validationService: ValidationService,
        protected utilService: UtilService,
        protected formService: FormService,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        if (!this.formVariables.baUnit.uid) {
            this.errorMessage = new ErrorResult('MESSAGES.BA_UNIT_REQUIRED').toMessage();
            return;
        }
        const PUBLICATION_FORM = 'PUBLICATION_FORM';
        this.dataService
            .getFormByName(PUBLICATION_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe((config) => {
                this.formConfig = config;
                this.isPublication = true;
                this.title = 'PUBLICATION.TITLE';
                this.fieldValues = this.publication;
                this.publication.baUnitId = this.formVariables.baUnit.uid;
                this.publication.baUnitVersion = this.formVariables.baUnit.version;
            });
    }

    save(publication: Publication) {
        const saveObs = publication.id
            ? this.publicationService.updatePublication(publication)
            : this.publicationService.createPublication(publication);

        saveObs.subscribe(
            (pub) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.publication = pub;
                this.saved.emit({
                    val: this.publication,
                    variable: { publicationId: { value: pub.id, type: 'String' } },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['publications']);
        }
    }

    cancel(publicationBackup) {
        _.merge(this.publication, publicationBackup);
        this.canceled.emit(true);
        this.goToList();
    }

    submit(publication: Publication) {
        Object.keys(publication).forEach((key) => (this.publication[key] = publication[key]));

        const saveObs = publication.id
            ? this.publicationService.updatePublication(publication)
            : this.publicationService.createPublication(publication);

        saveObs.subscribe(
            (pub) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.publication = pub;
                this.saved.emit({
                    val: this.publication,
                    variable: { publicationId: { value: pub.id, type: 'String' } },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }
}
