import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FormService } from '@app/core/services/form.service';
import { RdaiService } from '@app/core/services/rdai.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { FieldConfig } from '@app/core/models/field.model';
import { Rdai } from '@app/core/models/rdai.model';
import { Task } from '@app/core/models/task.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { Variables } from '@app/core/models/variables.model';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

@Component({
    selector: 'app-rdai',

    template: `<app-rdai-form
        *ngIf="rdai && formConfig"
        [rdai]="rdai"
        [config]="formConfig"
        [task]="task"
        [formVariables]="formVariables"
        (cancelButtonClicked)="cancel($event)"
        [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
        (saveButtonClicked)="save($event)"
    >
    </app-rdai-form> `,
})
export class RdaiComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;

    @Output() saved = new EventEmitter<{ val: Rdai; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    rdai: Rdai;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];
    transactionInstance: TransactionInstance;

    constructor(
        protected router: Router,
        protected rdaiService: RdaiService,
        protected route: ActivatedRoute,
        protected alertService: AlertService,
        protected validationService: ValidationService,
        protected utilService: UtilService,
        protected formService: FormService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private transactionInstanceService: TransactionInstanceService,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        const routeObs = this.route.params;

        routeObs
            .pipe(map((params: Params) => params['rdaiId']))
            .pipe(
                switchMap((paramRdaiId: string) => {
                    this.accessedByRouter = this.router.url.includes('rdai');
                    const rdaiId = paramRdaiId ? paramRdaiId : this.formVariables.rdaiId;
                    return rdaiId ? this.rdaiService.getRdai(new Rdai({ id: rdaiId })) : of(new Rdai());
                }),
            )
            .subscribe(
                (rdai) => (this.rdai = new Rdai(rdai)),
                (err) => this.alertService.apiError(err),
            );

        const RDAI_FORM = 'RDAI_FORM';
        this.dataService
            .getFormByName(RDAI_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe((config) => {
                this.formConfig = config;
            });

        this.transactionInstanceHistoryService
            .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
            .then((id) => {
                this.transactionInstanceService.getTransactionInstancesByWorkflowId(id).subscribe(
                    (transactionInstance) => {
                        this.transactionInstance = transactionInstance;
                    },
                    (err) => this.alertService.apiError(err),
                );
            })
            .catch((err) => this.alertService.apiError(err));
    }

    save(rdai: Rdai) {
        rdai.transactionInstance = this.transactionInstance;
        const saveObs = rdai.id ? this.rdaiService.updateRdai(rdai) : this.rdaiService.createRdai(rdai);

        saveObs.subscribe(
            (a) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.rdai = a;
                this.saved.emit({
                    val: this.rdai,
                    variable: {
                        rdaiId: { value: a.id, type: 'String' },
                        rdai: { value: JSON.stringify(this.rdai), type: 'Json' },
                    },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['rdais']);
        }
    }

    cancel(rdaiBackup) {
        _.merge(this.rdai, rdaiBackup);
        this.canceled.emit(true);
        this.goToList();
    }
}
