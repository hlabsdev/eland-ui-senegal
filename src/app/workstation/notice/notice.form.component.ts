import {
    Component,
    Input,
    Output,
    EventEmitter,
    ViewChild,
    AfterViewInit,
    ChangeDetectorRef,
    OnChanges,
    SimpleChanges,
    SimpleChange,
    OnDestroy,
    OnInit,
} from '@angular/core';
import { FormVariables } from '../baseForm/formVariables.model';
import { BAUnit } from '../baUnit/baUnit.model';
import { Subscription } from 'rxjs';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import * as _ from 'lodash';
import { DynamicFormComponent } from '@app/core/layout/elements/dynamic-form/dynamic-form.component';
import { ComplementaryInfo } from '@app/core/models/complementaryInfo.model';
import { FieldConfig } from '@app/core/models/field.model';
import { Task } from '@app/core/models/task.model';
import { TranslateService } from '@ngx-translate/core';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';

@Component({
    selector: 'app-notice-form',
    template: `<dynamic-form
        [title]="title"
        [fields]="config"
        [errorMessage]="errorMessage"
        [readOnly]="formVariables.isReadOnly"
        [hideSaveButton]="formVariables.isReadOnly"
        (submit)="submit($event)"
        [fieldValues]="fieldValues"
        (cancelButtonClicked)="cancel()"
        [saveToLadm]="true"
    >
    </dynamic-form>`,
})
export class NoticeFormComponent implements AfterViewInit, OnInit, OnChanges, OnDestroy {
    @ViewChild(DynamicFormComponent) form: DynamicFormComponent;
    @Input() complementaryInfo: ComplementaryInfo;
    @Input() config: FieldConfig[];
    @Input() showAllLabel: boolean;
    @Input() errorMessage: string;
    @Input() readOnly = false;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Output() saveButtonClicked = new EventEmitter<ComplementaryInfo>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Input() task: Task;

    baUnit: BAUnit;
    title: string;
    fieldValues: any;

    valueChanges: Subscription;

    constructor(
        protected translateService: TranslateService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        protected sourceService: SourceService,
        private changeDetector: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.translateService.get(`NOTICE.${this.formVariables.noticeSection}`).subscribe((val) => (this.title = val));

        this.fieldValues = this.complementaryInfo;
    }

    ngOnChanges(changes: SimpleChanges) {
        const error: SimpleChange = changes.errorMessage;
        if (error && error.currentValue) {
            this.errorMessage = error.currentValue;
        }
    }

    ngAfterViewInit() {
        this.setConfigs(this.formVariables.noticeSection);

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

                        const acts = _.map(admSources, (item) => ({ value: item.act, label: item.act.actNumber }));
                        this.config.find((item) => item.name === 'notice.requisition').options = <any>acts;
                        this.config
                            .find((item) => item.name === 'notice.requisition')
                            .options.unshift({
                                value: '',
                                label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
                            });
                    });
                });
            });

        this.changeDetector.detectChanges();
    }

    ngOnDestroy(): void {
        if (this.valueChanges) {
            this.valueChanges.unsubscribe();
        }
    }

    setConfigs(section) {
        this.config = this.config.map((item) => {
            item.isEnabled([section]);
            return item;
        });
    }

    submit(complementaryInfo: ComplementaryInfo) {
        Object.keys(complementaryInfo).forEach((key) => (this.complementaryInfo[key] = complementaryInfo[key]));
        this.saveButtonClicked.emit(this.complementaryInfo);
    }

    cancel() {
        this.form.form.reset();
        this.fieldValues = this.complementaryInfo;
        this.setConfigs(this.formVariables.noticeSection);
        this.cancelButtonClicked.emit(true);
        this.errorMessage = null;
    }
}
