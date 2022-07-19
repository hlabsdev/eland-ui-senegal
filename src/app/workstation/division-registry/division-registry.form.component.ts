import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { Task } from '@app/core/models/task.model';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SourceTypes } from '../../workstation/source/sourceType.model';
import { FormVariables } from '../baseForm/formVariables.model';
import { DivisionRegistry } from '@app/core/models/divisionRegistry.model';
import { DivisionRegistryService } from '@app/core/services/division-registry.service';

@Component({
    selector: 'app-division-registry-form',

    template: ` <dynamic-form
            *ngIf="this.isDivisionRegistry"
            [fields]="config"
            [title]="title"
            [readOnly]="readOnly"
            (submit)="submit($event)"
            [fieldValues]="fieldValues"
            (cancelButtonClicked)="cancel()"
            [saveToLadm]="true"
        ></dynamic-form>
        <core-alert *ngIf="this.errorMessage" [local]="true" [message]="errorMessage"></core-alert>`,
})
export class DivisionRegistryFormComponent implements OnInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() divisionRegistry: DivisionRegistry = new DivisionRegistry();
    @Input() readOnly: boolean;
    @Input() config: FieldConfig[];
    @Input() task: Task;
    @Input() formVariables: FormVariables;

    @Output() saveButtonClicked = new EventEmitter<DivisionRegistry>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    errorMessage: string;
    isDivisionRegistry = false;

    constructor(
        protected divisionRegistryService: DivisionRegistryService,
        protected route: ActivatedRoute,
        public validationService: ValidationService,
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        protected sourceService: SourceService,
        protected alertService: AlertService,
    ) {}

    ngOnInit(): void {
        if (this.task && this.task.processInstanceId) {
            if (!this.formVariables.baUnit.isBaUnitSet()) {
                this.errorMessage = new ErrorResult('MESSAGES.BA_UNIT_REQUIRED').toMessage();
                return;
            }

            // TODO: include logic to verify required parties

            this.divisionRegistry.registry = this.formVariables.baUnit.registryRecord.registry;
            this.divisionRegistry.applicant = this.formVariables.application.applicant;

            this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => {
                    this.transactionInstanceService.getTransactionInstancesByWorkflowId(id).subscribe((result) => {
                        const args: any = { transactionInstanceId: result.id };
                        this.sourceService.getSources(args).subscribe((sources) => {
                            const admSources = sources.content
                                .filter((item) => item.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE)
                                .filter((item) => (item.act.actNumber ? true : false));

                            if (admSources.length === 0) {
                                this.errorMessage = new ErrorResult('MESSAGES.ACT_REQUIRED').toMessage();
                                return;
                            }

                            this.isDivisionRegistry = true;

                            const acts = _.map(admSources, (item) => ({ value: item.act, label: item.act.actNumber }));
                            this.config.find((item) => item.name === 'act').options = <any>acts;
                            this.config
                                .find((item) => item.name === 'act')
                                .options.unshift({
                                    value: '',
                                    label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
                                });

                            this.title = 'DIVISION_REGISTRY.TITLE';
                            this.fieldValues = this.divisionRegistry;
                            this.changeDetector.detectChanges();

                            this.divisionRegistry.baUnitId = this.formVariables.baUnit.uid;
                            this.divisionRegistry.baUnitVersion = this.formVariables.baUnit.version;
                        });
                    });
                });
        }
    }

    submit(divisionRegistry: DivisionRegistry) {
        Object.keys(divisionRegistry).forEach((key) => (this.divisionRegistry[key] = divisionRegistry[key]));
        this.saveButtonClicked.emit(this.divisionRegistry);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }

    getSuggesteDivisionRegistryDepositNumber() {
        if (this.divisionRegistry.registry.code) {
            this.divisionRegistryService.getNextAvailableRegistryId(this.divisionRegistry).subscribe(
                (newDivisionRegistry) => {
                    ['depositNumber', 'depositFolio', 'depositVolume'].forEach((item) => {
                        this.divisionRegistry[item] = <number>newDivisionRegistry[item];
                        this.config.find((i) => i.name === item).value = <number>newDivisionRegistry[item];
                        if (this.form) {
                            this.form.form.get(item).setValue(newDivisionRegistry[item]);
                        }
                    });
                },
                (err) => this.alertService.apiError(err),
            );
        }
    }
}
