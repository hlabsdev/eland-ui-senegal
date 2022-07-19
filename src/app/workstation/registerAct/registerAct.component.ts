import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FieldConfig } from '@app/core/models/field.model';
import { RegisterAct } from '@app/core/models/registerAct.model';
import { Task } from '@app/core/models/task.model';
import { Variables } from '@app/core/models/variables.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FormService } from '@app/core/services/form.service';
import { UtilService } from '@app/core/utils/util.service';
import { RegisterActService } from '@app/core/services/register-act.service';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { Router, ActivatedRoute } from '@angular/router';
import { map } from 'rxjs/operators';
import { of } from 'rxjs';
import * as _ from 'lodash';
@Component({
    selector: 'app-register-act',
    template: `<app-register-act-form
        *ngIf="rda && formConfig"
        [rda]="rda"
        [config]="formConfig"
        [task]="task"
        [formVariables]="formVariables"
        (cancelButtonClicked)="cancel($event)"
        [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
        (saveButtonClicked)="save($event)"
    >
    </app-register-act-form> `,
})
export class RegisterActComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;

    @Output() saved = new EventEmitter<{ val: RegisterAct; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    rda: RegisterAct;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private registerActService: RegisterActService,
        private alertService: AlertService,
        private utilService: UtilService,
        private formService: FormService,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        const activate$ = this.formVariables.rdaId
            ? this.registerActService.getRegisterAct(this.formVariables.rdaId)
            : of(this.rda);
        activate$.subscribe(
            (rda) => {
                this.rda = new RegisterAct(rda);
                if (!this.rda.baUnitId) {
                    this.rda.baUnitId = this.formVariables.baUnit.uid;
                    this.rda.baUnitVersion = this.formVariables.baUnit.version;
                }
            },
            (err) => this.alertService.apiError(err),
        );
        const RDA_FORM = 'RDA_FORM';
        this.dataService
            .getFormByName(RDA_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe((config) => {
                this.formConfig = config;
            });
    }

    save(rda: RegisterAct) {
        const save$ = rda.id
            ? this.registerActService.updateRegistreAct(rda)
            : this.registerActService.createRegisterAct(rda);
        save$.subscribe(
            (response) => {
                this.rda = response;
                this.saved.emit({ val: this.rda, variable: { rdaId: { value: response.id, type: 'String' } } });
                this.formVariables.rdaId = response.id;
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
            },
            (error) => this.alertService.apiError(error),
        );
    }

    cancel(rdaToCancel) {
        _.merge(this.rda, rdaToCancel);
        this.canceled.emit(true);
    }
}
