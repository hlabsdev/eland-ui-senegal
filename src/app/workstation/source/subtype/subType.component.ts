import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import * as _ from 'lodash';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { Component, Input, Output, EventEmitter, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { Subscription } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { Act } from '@app/core/models/act.model';
import { AdministrativeSource } from '@app/core/models/administrativeSource.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Source } from '@app/core/models/source.model';
import { Task } from '@app/core/models/task.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { TranslateService } from '@ngx-translate/core';
import { SelectService } from '@app/core/layout/elements/select/select.service';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';

@Component({
    selector: 'app-sub-type',
    template: `<dynamic-form
            [title]="title"
            *ngIf="formConfig && administrativeSource"
            [fields]="formConfig"
            [readOnly]="false"
            [hideSaveButton]="this.isAct && formVariables.isReadOnly"
            (submit)="save($event)"
            [fieldValues]="fieldValues"
            (cancelButtonClicked)="cancel()"
            [saveToLadm]="true"
        >
        </dynamic-form>
        <core-alert *ngIf="!administrativeSource" [local]="true" [message]="errorMessage"></core-alert>`,
})
export class SubTypeComponent extends FormTemplateBaseComponent implements OnInit, OnDestroy {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() readOnly = false;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;
    @Input() administrativeSource: Source;
    @Output() saveButtonClicked = new EventEmitter<any>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    act: Act = new Act();
    isAct = false;
    baUnit: BAUnit;
    formConfig: FieldConfig[];
    sources: Source[];
    errorMessage: string;
    administrativeSources: Source[];
    transactionInstance: TransactionInstance;
    selectSubscription: Subscription;

    acquisitionSurfaceS2AFieldValue: number;
    acquisitionSurfaceUnitS2AFieldValue: any;
    alieneSurfaceS2DFieldValue: number;
    alieneSurfaceUnitS2DFieldValue: any;

    constructor(
        protected alertService: AlertService,
        protected utilService: UtilService,
        protected translateService: TranslateService,
        protected sourceService: SourceService,
        private transactionInstanceService: TransactionInstanceService,
        protected baUnitService: BAUnitService,
        private selectService: SelectService,
        private transactionInstanceHistoryService: TransactionHistoryService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.selectSubscription = this.selectService.select$.subscribe((data: any) => {
            if (data && data.name === 'sourceId') {
                this.getActValue(data);
            }
        });

        let sourcesFromProcessInstance$;

        if (this.task && this.task.processInstanceId) {
            sourcesFromProcessInstance$ = this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => this.transactionInstanceService.getTransactionInstancesByWorkflowId(id).toPromise())
                .catch((err) => this.alertService.apiError(err));
        } else {
            sourcesFromProcessInstance$ = Promise.resolve();
        }

        sourcesFromProcessInstance$
            .then((val) => {
                let args: any = { baUnitId: this.formVariables.baUnitId };
                if (val) {
                    args = { transactionInstanceId: val.id };
                    this.transactionInstance = val;
                }

                if (_.isEmpty(args)) {
                    return Promise.resolve([]);
                }
                return this.sourceService.getSources(args).toPromise();
            })
            .then((sourceResult) => {
                this.sources = sourceResult;
                this.administrativeSources = _.filter(
                    sourceResult.content,
                    (source) => source.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE,
                );
                this.administrativeSource = _.find(
                    sourceResult.content,
                    (source) => source.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE,
                );

                if (!this.administrativeSource && this.formVariables.administrativeSourceType === 'ACT') {
                    this.errorMessage = new ErrorResult('MESSAGES.ADMINISTRATIVE_SOURCE_REQUIRED').toMessage();
                    return;
                }

                this.getFormFields();
            })
            .catch((err) => this.alertService.apiError(err));
    }

    ngOnDestroy(): void {
        this.selectSubscription.unsubscribe();
    }

    save($event) {
        this.administrativeSource = this.administrativeSources.find(
            (item) => item.id === this.form.form.value.sourceId,
        );
        if (!this.administrativeSource) {
            return this.alertService.apiError('MESSAGES.UNABLE_TO_FIND_A_SOURCE_TO_THE_SAVE_ACT');
        }

        this.administrativeSource.act = new Act(this.fieldValues);

        this.sourceService.updateSource(this.administrativeSource).subscribe(
            () => {
                this.alertService.success();
                this.saveButtonClicked.emit(null);
            },
            (err) => this.alertService.apiError(err),
        );
    }

    getFormFields() {
        this.translateService.get(`SOURCES.${this.formVariables.administrativeSourceType}`).subscribe((val) => {
            this.title = val;
        });

        let fields = [];
        let fieldData: any = [];
        this.isAct = this.formVariables.administrativeSourceType === 'ACT';

        fields = this.act.getActForm(this.formVariables.isReadOnly);
        const administrativeAct = new AdministrativeSource();
        fieldData = administrativeAct.act;

        this.fieldValues = fieldData;

        this.formConfig = _.map(fields, (input) => this.utilService.createField(input));

        if (this.isAct) {
            this.formConfig.find((item) => item.name === 'sourceId').options = this.administrativeSources.map(
                (item) => ({ label: item.extArchive.fileName, value: item.id }),
            );
            this.formConfig
                .find((item) => item.name === 'sourceId')
                .options.unshift({ value: '', label: this.translateService.instant('COMMON.ACTIONS.SELECT') });
            this.formConfig.find((item) => item.name === 'sourceId').readOnly = false;
        }
    }

    getActValue(data) {
        const administrativeSource = this.administrativeSources.find((item) => item.id === data.value);
        this.form.form.reset();
        this.form.form.get('sourceId').setValue(data.value);
        this.fieldValues = administrativeSource ? administrativeSource.act : {};
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }
}
