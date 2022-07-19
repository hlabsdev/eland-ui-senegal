import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { FieldConfig } from '@app/core/models/field.model';
import { Rdai } from '@app/core/models/rdai.model';
import { Task } from '@app/core/models/task.model';
import { RdaiService } from '@app/core/services/rdai.service';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { RegistryService } from '@app/core/services/registry.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';

@Component({
    selector: 'app-rdai-form',

    template: `<dynamic-form
            *ngIf="this.isRdai"
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
export class RdaiFormComponent implements OnInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() rdai: Rdai = new Rdai();
    @Input() readOnly: boolean;
    @Input() config: FieldConfig[];
    @Input() task: Task;
    @Input() formVariables: FormVariables;

    @Output() saveButtonClicked = new EventEmitter<Rdai>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    errorMessage: string;
    isRdai = false;

    constructor(
        protected rdaiService: RdaiService,
        protected route: ActivatedRoute,
        public validationService: ValidationService,
        private changeDetector: ChangeDetectorRef,
        private translateService: TranslateService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        protected sourceService: SourceService,
        private utilService: UtilService,
        protected alertService: AlertService,
        private registryService: RegistryService,
        private parametersService: ParametersService,
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

            this.rdai.registry = this.formVariables.baUnit.registryRecord.registry;

            if (this.rdai.depositNumber === undefined) {
                this.getSuggestedRdaiDepositNumber();
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

                            this.isRdai = true;

                            const acts = _.map(admSources, (item) => ({ value: item.act, label: item.act.actNumber }));
                            this.config.find((item) => item.name === 'act').options = <any>acts;
                            this.config
                                .find((item) => item.name === 'act')
                                .options.unshift({
                                    value: '',
                                    label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
                                });

                            this.utilService
                                .mapToSelectItems(this.parametersService.getAllRegion(), '', 'value.code')
                                .subscribe((regions: SelectItem[]) => {
                                    this.config.find((item) => item.name === 'region').options = regions;
                                });

                            this.title = 'RDAI.TITLE';

                            this.rdai.baUnitId = this.formVariables.baUnit.uid;
                            this.rdai.baUnitVersion = this.formVariables.baUnit.version;
                            this.rdai.baUnitResponsibleOffice = this.formVariables.baUnit.responsibleOffice.name;
                            this.fieldValues = this.rdai;
                            this.changeDetector.detectChanges();
                        });
                    });
                });
        }
    }

    submit(rdai: Rdai) {
        Object.keys(rdai).forEach((key) => (this.rdai[key] = rdai[key]));
        this.saveButtonClicked.emit(this.rdai);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }

    getSuggestedRdaiDepositNumber() {
        if (this.rdai.registry.code) {
            this.rdaiService.getNextAvailableRegistryId(this.rdai).subscribe(
                (newRdai) => {
                    ['depositNumber', 'depositFolio', 'depositVolume'].forEach((item) => {
                        this.rdai[item] = <number>newRdai[item];
                        this.config.find((i) => i.name === item).value = <number>newRdai[item];
                        if (this.form) {
                            this.form.form.get(item).setValue(newRdai[item]);
                        }
                    });
                },
                (err) => this.alertService.apiError(err),
            );
        }
    }
}
