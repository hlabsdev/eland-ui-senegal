import { OnInit, Component, Input, Output, EventEmitter } from '@angular/core';
import { DataService } from '@app/data/data.service';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';
import { map } from 'rxjs/operators';
import * as _ from 'lodash';
import { Observable, of } from 'rxjs';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { FieldConfig } from '@app/core/models/field.model';
import { GenericDocument } from '@app/core/models/genericDocument.model';
import { Rdai } from '@app/core/models/rdai.model';
import { Task } from '@app/core/models/task.model';
import { TransactionInstance } from '@app/core/models/transactionInstance.model';
import { Variables } from '@app/core/models/variables.model';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { UtilService } from '@app/core/utils/util.service';
import { ContentService } from '@app/core/services/content.service';
import { FormService } from '@app/core/services/form.service';
import { RdaiService } from '@app/core/services/rdai.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';

@Component({
    selector: 'app-complementary-info',
    template: `<app-complementary-info-form
        *ngIf="complementaryInfo && formConfig"
        [readOnly]="readOnly"
        [formVariables]="formVariables"
        [complementaryInfo]="complementaryInfo"
        [config]="formConfig"
        (cancelButtonClicked)="cancel()"
        (saveButtonClicked)="save($event)"
        [errorMessage]="errorMessage"
    >
    </app-complementary-info-form>`,
})
export class ComplementaryInfoComponent implements OnInit {
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
    rdai: Rdai;

    constructor(
        protected alertService: AlertService,
        protected utilService: UtilService,
        protected formService: FormService,
        protected contentService: ContentService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private rdaiService: RdaiService,
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
                    this.complementaryInfo.numberInscription = ba.slipNumber + 1;
                } else {
                    this.complementaryInfo = new ComplementaryInfo();
                    this.complementaryInfo.numberInscription = ba.slipNumber + 1;
                }

                this.checkBordereauInscription().subscribe(
                    (doc) => {
                        if (doc && doc.body) {
                            this.complementaryInfo.inscription = doc.body;
                        }

                        this.complementaryInfo.rdaiId = this.complementaryInfo.rdaiId
                            ? this.complementaryInfo.rdaiId
                            : this.formVariables.getPath('rdaiId');

                        if (this.formVariables.getPath('complementaryInfoSection') === 'BORDEREAU') {
                            if (!this.complementaryInfo.rdaiId) {
                                return this.alertService.error('MESSAGES.BORDEREAU_RDAI_REQUIRED');
                            }

                            this.rdaiService.getRdai(new Rdai({ id: this.complementaryInfo.rdaiId })).subscribe(
                                (rdai) => {
                                    this.complementaryInfo.rdai = rdai;
                                    this.getFormFields();
                                },
                                (err) => this.alertService.apiError(err),
                            );
                        } else {
                            this.getFormFields();
                        }
                    },
                    (err) => this.alertService.apiError(err),
                );
            },
            (err) => this.alertService.apiError(err),
        );
    }

    checkBordereauInscription(): Observable<GenericDocument | null> {
        if (
            !this.complementaryInfo.inscription &&
            this.formVariables.getPath('complementaryInfoSection') === 'BORDEREAU'
        ) {
            return this.generateDoc();
        }
        return of(null);
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
        const COMPLEMENTARY_INFO_FORM = 'COMPLEMENTARY_INFO_FORM';

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

    generateDoc(): Observable<GenericDocument> {
        const args = {
            documentType: 'thymeleaf',
            documentTemplate: 'bordereau-inscription',
            baUnitId: this.formVariables.getPath('baUnit.uid'),
            generateDocumentId: this.formVariables.generateDocumentId ? this.formVariables.generateDocumentId : '',
            signatoryAuthority: this.formVariables.signatoryAuthority ? this.formVariables.signatoryAuthority : '',
            slipType: this.formVariables.slipType ? this.formVariables.slipType : '',
            applicationId: this.formVariables.applicationId ? this.formVariables.applicationId : '',
        };

        return this.contentService.getTemplate(args);
    }
}
