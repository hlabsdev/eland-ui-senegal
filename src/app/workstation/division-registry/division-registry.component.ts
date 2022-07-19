import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FormService } from '@app/core/services/form.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { FieldConfig } from '@app/core/models/field.model';
import { Task } from '@app/core/models/task.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { Variables } from '@app/core/models/variables.model';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { DivisionRegistryService } from '@app/core/services/division-registry.service';
import { DivisionRegistry } from '@app/core/models/divisionRegistry.model';

@Component({
    selector: 'app-division-registry',
    template: `
        <app-division-registry-form
            *ngIf="divisionRegistry && formConfig"
            [divisionRegistry]="divisionRegistry"
            [config]="formConfig"
            [task]="task"
            [formVariables]="formVariables"
            (cancelButtonClicked)="cancel($event)"
            [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
            (saveButtonClicked)="save($event)"
        >
        </app-division-registry-form>
    `,
})
export class DivisionRegistryComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;

    @Output() saved = new EventEmitter<{ val: DivisionRegistry; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    divisionRegistry: DivisionRegistry;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];
    transactionInstance: TransactionInstance;

    constructor(
        protected router: Router,
        protected divisionRegistryService: DivisionRegistryService,
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
            .pipe(map((params: Params) => params['divisionRegistryIdonRegistryId']))
            .pipe(
                switchMap((paramDivisionRegistryId: string) => {
                    this.accessedByRouter = this.router.url.includes('divisionRegistry');
                    const divisionRegistryId = paramDivisionRegistryId
                        ? paramDivisionRegistryId
                        : this.formVariables.divisionRegistryId;
                    return divisionRegistryId
                        ? this.divisionRegistryService.getDivisionRegistry(
                              new DivisionRegistry({ id: divisionRegistryId }),
                          )
                        : of(new DivisionRegistry());
                }),
            )
            .subscribe(
                (divisionRegistry) => (this.divisionRegistry = new DivisionRegistry(divisionRegistry)),
                (err) => this.alertService.apiError(err),
            );

        const DIVISION_REGISTRY_FORM = 'DIVISION_REGISTRY_FORM';
        this.dataService
            .getFormByName(DIVISION_REGISTRY_FORM)
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

    save(divisionRegistry: DivisionRegistry) {
        divisionRegistry.transactionInstance = this.transactionInstance;
        const saveObs = divisionRegistry.id
            ? this.divisionRegistryService.updateDivisionRegistry(divisionRegistry)
            : this.divisionRegistryService.createDivisionRegistry(divisionRegistry);

        saveObs.subscribe(
            (a) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.divisionRegistry = a;
                this.saved.emit({
                    val: this.divisionRegistry,
                    variable: {
                        divisionRegistryId: { value: a.id, type: 'String' },
                        divisionRegistry: { value: JSON.stringify(this.divisionRegistry), type: 'Json' },
                    },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['divisionRegistries']);
        }
    }

    cancel(divisionRegistryBackup) {
        _.merge(this.divisionRegistry, divisionRegistryBackup);
        this.canceled.emit(true);
        this.goToList();
    }
}
