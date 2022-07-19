import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { FieldConfig } from '@app/core/models/field.model';
import { RegisterAct } from '@app/core/models/registerAct.model';
import { Task } from '@app/core/models/task.model';
import { RegisterActService } from '@app/core/services/register-act.service';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { WarningResult } from '@app/core/utils/models/warningResult.model';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';

@Component({
    selector: 'app-register-act-form',
    template: ` <dynamic-form
            *ngIf="rda && hasAct()"
            [fields]="config"
            [title]="title"
            [readOnly]="readOnly"
            (submit)="submit()"
            [fieldValues]="fieldValues"
            (cancelButtonClicked)="cancel()"
            [saveToLadm]="true"
        ></dynamic-form>
        <core-alert
            *ngIf="this.errorMessage || this.warningMessage"
            [local]="true"
            [message]="errorMessage ? errorMessage : warningMessage"
        ></core-alert>`,
})
export class RegisterActFormComponent implements OnInit {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;

    @Input() rda: RegisterAct = new RegisterAct();
    @Input() readOnly: boolean;
    @Input() config: FieldConfig[];
    @Input() task: Task;
    @Input() formVariables: FormVariables;

    @Output() saveButtonClicked = new EventEmitter<RegisterAct>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();

    title: string;
    fieldValues: any;
    errorMessage: string;
    warningMessage: string;
    acts: { value: any; label: string }[];
    constructor(
        private registerActService: RegisterActService,
        private route: ActivatedRoute,
        private validationService: ValidationService,
        private transactionInstanceService: TransactionInstanceService,
        private translateService: TranslateService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private changeDetector: ChangeDetectorRef,
        private sourceService: SourceService,
    ) {}

    ngOnInit(): void {
        this.transactionInstanceHistoryService
            .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
            .then((id) => {
                this.transactionInstanceService
                    .getTransactionInstancesByWorkflowId(this.task.processInstanceId)
                    .subscribe((result) => {
                        const args: any = { transactionInstanceId: result.id };
                        this.sourceService.getSources(args).subscribe((source) => {
                            const adminSource = source.content.filter(
                                (item) => item.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE,
                            );
                            if ((adminSource && adminSource.length === 0) || this.isValideAct(adminSource)) {
                                this.warningMessage = new WarningResult('MESSAGES.ACT_RDA_REQUIRED').toMessage();
                                return;
                            }
                            this.acts = _.map(adminSource, (item) =>
                                item && item.act && item.act.actNumber
                                    ? { value: item.act, label: item.act.actNumber }
                                    : { value: '', label: '' },
                            );
                            if (this.hasAct()) {
                                this.config.find((item) => item.name === 'act').options = <any>this.acts;
                                this.config
                                    .find((item) => item.name === 'act')
                                    .options.unshift({
                                        value: '',
                                        label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
                                    });
                                this.title = this.rda.id ? 'RDA.TITLE_EDIT' : 'RDA.TITLE_ADD';
                                this.fieldValues = this.rda;
                                this.changeDetector.detectChanges();
                            }
                        });
                    });
            });
    }

    hasAct() {
        return this.acts && this.acts.length > 0;
    }

    submit() {
        this.saveButtonClicked.emit(this.rda);
    }

    cancel() {
        this.cancelButtonClicked.emit(true);
    }

    private isValideAct(adminSources): boolean {
        let validAct = false;
        if (adminSources && adminSources.length > 0) {
            _.map(adminSources, (adminSource) => {
                validAct = validAct || (adminSource.act && adminSource.act.id === undefined);
            });
        }
        return validAct;
    }
}
