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
import { GeneralFormalityRegistry } from '@app/core/models/generalFormalityRegistry.model';
import { GeneralFormalityRegistryService } from '@app/core/services/generalFormalityRegistry.service';

@Component({
    selector: 'app-general-formality-registry',
    template: `
        <app-general-formality-registry-form
            *ngIf="generalFormalityRegistry && formConfig"
            [generalFormalityRegistry]="generalFormalityRegistry"
            [config]="formConfig"
            [task]="task"
            [formVariables]="formVariables"
            (cancelButtonClicked)="cancel($event)"
            [readOnly]="formVariables.isReadOnly || this.accessedByRouter"
            (saveButtonClicked)="save($event)"
        >
        </app-general-formality-registry-form>
    `,
})
export class GeneralFormalityRegistryComponent implements OnInit {
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;

    @Output() saved = new EventEmitter<{ val: GeneralFormalityRegistry; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();

    generalFormalityRegistry: GeneralFormalityRegistry;
    accessedByRouter: boolean;
    formConfig: FieldConfig[];
    transactionInstance: TransactionInstance;

    constructor(
        protected router: Router,
        protected generalFormalityRegistryService: GeneralFormalityRegistryService,
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
            .pipe(map((params: Params) => params['generalFormalityRegistryIdonRegistryId']))
            .pipe(
                switchMap((paramGeneralFormalityRegistryId: string) => {
                    this.accessedByRouter = this.router.url.includes('generalFormalityRegistry');
                    const generalFormalityRegistryId = paramGeneralFormalityRegistryId
                        ? paramGeneralFormalityRegistryId
                        : this.formVariables.generalFormalityRegistryId;
                    return generalFormalityRegistryId
                        ? this.generalFormalityRegistryService.getGeneralFormalityRegistry(
                              new GeneralFormalityRegistry({ id: generalFormalityRegistryId }),
                          )
                        : of(new GeneralFormalityRegistry());
                }),
            )
            .subscribe(
                (generalFormalityRegistry) =>
                    (this.generalFormalityRegistry = new GeneralFormalityRegistry(generalFormalityRegistry)),
                (err) => this.alertService.apiError(err),
            );

        const GENERAL_FORMALITY_REGISTRY_FORM = 'GENERAL_FORMALITY_REGISTRY_FORM';
        this.dataService
            .getFormByName(GENERAL_FORMALITY_REGISTRY_FORM)
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

    save(generalFormalityRegistry: GeneralFormalityRegistry) {
        generalFormalityRegistry.transactionInstance = this.transactionInstance;
        // eslint-disable-next-line max-len
        const saveObs = generalFormalityRegistry.id
            ? this.generalFormalityRegistryService.updateGeneralFormalityRegistry(generalFormalityRegistry)
            : this.generalFormalityRegistryService.createGeneralFormalityRegistry(generalFormalityRegistry);

        saveObs.subscribe(
            (a) => {
                this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
                this.generalFormalityRegistry = a;
                this.saved.emit({
                    val: this.generalFormalityRegistry,
                    variable: {
                        generalFormalityRegistryId: { value: a.id, type: 'String' },
                        generalFormalityRegistry: {
                            value: JSON.stringify(this.generalFormalityRegistry),
                            type: 'Json',
                        },
                    },
                });
                this.goToList();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    goToList() {
        if (this.accessedByRouter) {
            return this.router.navigate(['generalFormalityRegistries']);
        }
    }

    cancel(generalFormalityRegistryBackup) {
        _.merge(this.generalFormalityRegistry, generalFormalityRegistryBackup);
        this.canceled.emit(true);
        this.goToList();
    }
}
