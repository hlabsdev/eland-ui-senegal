import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { FieldConfig } from '@app/core/models/field.model';
import { FormService } from '@app/core/services/form.service';
import { Task } from '@app/core/models/task.model';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { Variables } from '@app/core/models/variables.model';
import * as _ from 'lodash';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { DataService } from '../../../data/data.service';
import { FormVariables } from '../../baseForm/formVariables.model';
import { OppositionRegistryService } from '@app/core/services/oppositionRegistry.service';
import { OppositionRegistry } from '@app/core/models/oppositionRegistry.model';

@Component({
    selector: 'app-opposition-registry',
    template: `<app-opposition-registry-form
        *ngIf="oppositionRegistry && formConfig"
        [oppositionRegistry]="oppositionRegistry"
        [config]="formConfig"
        [task]="task"
        [formVariables]="formVariables"
        (cancelButtonClicked)="cancel($event)"
        [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
        (saveButtonClicked)="save($event)"
    >
    </app-opposition-registry-form> `,
})
export class OppositionRegistryComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;

    @Output() saved = new EventEmitter<{ val: OppositionRegistry; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    oppositionRegistry: OppositionRegistry;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];
    transactionInstance: TransactionInstance;

    constructor(
        protected router: Router,
        protected oppositionRegistryService: OppositionRegistryService,
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
            .pipe(map((params: Params) => params['oppositionRegistryIdonRegistryId']))
            .pipe(
                switchMap((paramOppositionRegistryId: string) => {
                    this.accessedByRouter = this.router.url.includes('oppositionregistry');
                    const oppositionRegistryId = paramOppositionRegistryId
                        ? paramOppositionRegistryId
                        : this.formVariables.oppositionRegistryId;
                    return oppositionRegistryId
                        ? this.oppositionRegistryService.getOppositionRegistry(
                              new OppositionRegistry({ id: oppositionRegistryId }),
                          )
                        : of(new OppositionRegistry());
                }),
            )
            .subscribe(
                (oppositionRegistry) => (this.oppositionRegistry = new OppositionRegistry(oppositionRegistry)),
                (err) => this.alertService.apiError(err),
            );

        const OPPOSITION_REGISTRY_FORM = 'OPPOSITION_REGISTRY_FORM';
        this.dataService
            .getFormByName(OPPOSITION_REGISTRY_FORM)
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

    save(oppositionRegistry: OppositionRegistry) {
        const saveObs = oppositionRegistry.id
            ? this.oppositionRegistryService.updateOppositionRegistry(oppositionRegistry)
            : this.oppositionRegistryService.createOppositionRegistry(oppositionRegistry);

        saveObs.subscribe(
            (a) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.oppositionRegistry = a;
                this.saved.emit({
                    val: this.oppositionRegistry,
                    variable: {
                        oppositionRegistryId: { value: a.id, type: 'String' },
                        oppositionRegistry: { value: JSON.stringify(this.oppositionRegistry), type: 'Json' },
                    },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['oppositionsregistry']);
        }
    }

    cancel(oppositionRegistryBackup) {
        _.merge(this.oppositionRegistry, oppositionRegistryBackup);
        this.canceled.emit(true);
        this.goToList();
    }
}
