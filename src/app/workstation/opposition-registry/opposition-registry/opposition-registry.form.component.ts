import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { OppositionRegistry } from '@app/core/models/oppositionRegistry.model';
import { Task } from '@app/core/models/task.model';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SourceTypes } from '../../source/sourceType.model';
import { FormVariables } from '../../baseForm/formVariables.model';
import { DivisionRegistry } from '@app/core/models/divisionRegistry.model';
import { DivisionRegistryService } from '@app/core/services/division-registry.service';
import { OppositionRegistryService } from '@app/core/services/oppositionRegistry.service';
import { Registry } from '@app/core/models/registry.model';

@Component({
    selector: 'app-opposition-registry-form',

    template: ` <dynamic-form
            *ngIf="this.isOppositionRegistry"
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
export class OppositionRegistryFormComponent implements OnInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() oppositionRegistry: OppositionRegistry = new OppositionRegistry();
    @Input() readOnly: boolean;
    @Input() config: FieldConfig[];
    @Input() task: Task;
    @Input() formVariables: FormVariables;

    @Output() saveButtonClicked = new EventEmitter<OppositionRegistry>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    errorMessage: string;
    registry: Registry;
    isOppositionRegistry = false;
    listdivisionRegistry: any[];
    divisionRegistry: DivisionRegistry;

    constructor(
        protected oppositionRegistryService: OppositionRegistryService,
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

            if (!this.formVariables.baUnit.hasPrincipalParcel()) {
                this.errorMessage = new ErrorResult('MESSAGES.PARCEL_PRINCIPAL_REQUIRED').toMessage();
                return;
            }
            this.divisionRegistryService.getDivisionRegistries().subscribe((res) => {
                this.listdivisionRegistry = res.content;
                this.listdivisionRegistry.forEach((element) => {
                    this.divisionRegistry = element;
                });
                const lists = _.map(this.listdivisionRegistry, (item) => ({ value: item, label: item.entryNumber }));
                this.config.find((item) => item.name === 'divisionRegistry').options = <any>lists;
                this.config
                    .find((item) => item.name === 'divisionRegistry')
                    .options.unshift({ value: '', label: this.translateService.instant('COMMON.ACTIONS.SELECT') });
            });
            this.registry = this.formVariables.baUnit.registryRecord.registry;
            if (this.oppositionRegistry.depositNumber === undefined) {
                this.getSuggestedOppositionRegistryDepositNumber();
            }
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
                            this.isOppositionRegistry = true;

                            const acts = _.map(admSources, (item) => ({ value: item.act, label: item.act.actNumber }));
                            this.config.find((item) => item.name === 'act').options = <any>acts;
                            this.config
                                .find((item) => item.name === 'act')
                                .options.unshift({
                                    value: '',
                                    label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
                                });

                            this.title = 'OPPOSITION_REGISTRY.TITLE';
                            this.fieldValues = this.oppositionRegistry;
                            this.changeDetector.detectChanges();

                            this.oppositionRegistry.baUnitId = this.formVariables.baUnit.uid;
                            this.oppositionRegistry.baUnitVersion = this.formVariables.baUnit.version;
                        });
                    });
                });
        }
    }

    submit(oppositionRegistry: OppositionRegistry) {
        Object.keys(oppositionRegistry).forEach((key) => (this.oppositionRegistry[key] = oppositionRegistry[key]));
        this.saveButtonClicked.emit(this.oppositionRegistry);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }

    getSuggestedOppositionRegistryDepositNumber() {
        if (this.registry.code) {
            this.oppositionRegistryService.getNextAvailableRegistryId(this.registry.id).subscribe(
                (newOP) => {
                    ['depositNumber', 'depositFolio', 'depositVolume', 'entryNumber'].forEach((item) => {
                        this.oppositionRegistry[item] = <number>newOP[item];
                        this.config.find((i) => i.name === item).value = <number>newOP[item];
                        if (this.form) {
                            this.form.form.get(item).setValue(newOP[item]);
                        }
                    });
                },
                (err) => this.alertService.apiError(err),
            );
        }
    }
}
