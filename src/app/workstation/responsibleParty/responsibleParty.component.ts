import { OnInit, Component, Input, EventEmitter, Output, ViewChild, OnChanges } from '@angular/core';
import { ResponsibleParty } from '@app/core/models/responsibleParty.model';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { DataService } from '@app/data/data.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FormService } from '@app/core/services/form.service';
import { UtilService } from '@app/core/utils/util.service';
import { FieldConfig } from '@app/core/models/field.model';

@Component({
    selector: 'app-responsible-party',
    template: `
        <app-responsible-party-form
            *ngIf="responsibleParty && formConfig"
            [readOnly]="readOnly"
            [responsibleParty]="responsibleParty"
            [showAllLabel]="accessedByRouter"
            [config]="formConfig"
            (cancelButtonClicked)="canceled.emit($event)"
            (saveButtonClicked)="save($event)"
            [errorMessage]="errorMessage"
        >
        </app-responsible-party-form>
    `,
})
export class ResponsiblePartyComponent implements OnInit, OnChanges {
    @Input() responsibleParty: ResponsibleParty = new ResponsibleParty();
    @Input() readOnly = false;

    @Output() saved = new EventEmitter<ResponsibleParty>();
    @Output() canceled = new EventEmitter<ResponsibleParty>();
    @Output() dataLoad = new EventEmitter<boolean>();

    errorMessage: string;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];
    RESPONSIBLE_PARTY_FORM = 'RESPONSIBLE_PARTY_FORM';

    constructor(
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected router: Router,
        protected formService: FormService,
        protected utilService: UtilService,
        private dataService: DataService,
    ) {}

    ngOnInit() {
        this.getForm();
    }

    ngOnChanges(changes) {
        this.getForm();
    }

    getForm() {
        return this.dataService
            .getFormByName(this.RESPONSIBLE_PARTY_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe(
                (config) => {
                    this.formConfig = config;
                    this.dataLoad.emit(true);
                },
                (err) => this.alertService.apiError(err),
            );
    }

    save(responsibleParty: ResponsibleParty) {
        this.responsibleParty = responsibleParty;
        this.saved.emit(responsibleParty);
    }
}
