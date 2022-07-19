import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { FormService } from '@app/core/services/form.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { ContentService } from '@app/core/services/content.service';
import { Task } from '@app/core/models/task.model';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { FieldConfig } from '@app/core/models/field.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { Variables } from '@app/core/models/variables.model';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Notice } from '@app/core/models/notice.model';

@Component({
    selector: 'app-notice',
    template: `<app-notice-form
        *ngIf="complementaryInfo && formConfig"
        [readOnly]="readOnly"
        [formVariables]="formVariables"
        [task]="task"
        [complementaryInfo]="complementaryInfo"
        [config]="formConfig"
        (cancelButtonClicked)="cancel()"
        (saveButtonClicked)="save($event)"
        [errorMessage]="errorMessage"
    >
    </app-notice-form>`,
})
export class NoticeComponent implements OnInit {
    @Input() readOnly = false;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() task: Task;
    @Output() saved = new EventEmitter<{ baUnit: BAUnit; variable: Variables }>();
    @Output() canceled = new EventEmitter<BAUnit>();

    title: string;
    fieldValues: any;
    baUnit: BAUnit;
    complementaryInfo: ComplementaryInfo = new ComplementaryInfo();
    formConfig: FieldConfig[];
    errorMessage: string;
    transactionInstance: TransactionInstance;

    constructor(
        protected alertService: AlertService,
        protected utilService: UtilService,
        protected formService: FormService,
        protected contentService: ContentService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        protected baUnitService: BAUnitService,
        private dataService: DataService,
    ) {}

    ngOnInit(): void {
        if (!this.formVariables.getPath('baUnit.uid')) {
            return this.alertService.error('MESSAGES.BA_UNIT_REQUIRED');
        }

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

        this.baUnitService.getBAUnit(this.formVariables.baUnit).subscribe(
            (ba) => {
                this.baUnit = ba;
                if (ba.complementaryInfo) {
                    this.complementaryInfo = ba.complementaryInfo;
                } else if (this.formVariables.complementaryInfo) {
                    this.complementaryInfo = this.formVariables.complementaryInfo;
                } else {
                    this.complementaryInfo = new ComplementaryInfo();
                    this.complementaryInfo.numberInscription = ba.slipNumber + 1;
                }
                this.verifyNotice();
                this.getFormFields();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    verifyNotice() {
        if (!this.complementaryInfo.notice) {
            this.complementaryInfo.notice = new Notice();
        }
    }

    save(complementaryInfo: ComplementaryInfo) {
        const baUnit = this.baUnit;
        this.baUnit.complementaryInfo = this.baUnit.complementaryInfo
            ? this.baUnit.complementaryInfo
            : new ComplementaryInfo();
        _.merge(this.baUnit.complementaryInfo, complementaryInfo);
        this.baUnit.complementaryInfo.transactionInstance = this.transactionInstance;

        this.baUnitService
            .updateBAUnit({
                baUnit,
                baUnitFormFieldsRequired: this.formVariables.baUnitFormFieldsRequired,
            })
            .subscribe(
                (response) => {
                    this.baUnit = response;
                    this.alertService.success();

                    this.saved.emit({
                        baUnit: this.baUnit,
                        variable: {
                            baUnit: { value: JSON.stringify(this.baUnit), type: 'Json' },
                            titleNumber: { value: this.baUnit.getTitle(), type: 'String' },
                        },
                    });
                },
                (err) => this.alertService.apiError(err),
            );
    }

    getFormFields() {
        const COMPLEMENTARY_INFO_FORM = 'NOTICES_FORM';

        this.dataService
            .getFormByName(COMPLEMENTARY_INFO_FORM)
            .pipe(map((form) => this.utilService.getFormFieldConfig(form)))
            .subscribe(
                (config) => {
                    this.formConfig = config;
                },
                (err) => this.alertService.apiError(err),
            );
    }

    cancel() {
        this.canceled.emit(this.baUnit);
    }
}
