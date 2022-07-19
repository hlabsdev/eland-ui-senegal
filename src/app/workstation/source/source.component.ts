import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import { SourceTypes } from '@app/workstation/source/sourceType.model';
import { NgForm } from '@angular/forms';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import Utils from '@app/core/utils/utils';
import { FormVariables } from '../baseForm/formVariables.model';
import * as _ from 'lodash';
import { AdministrativeSource } from '@app/core/models/administrativeSource.model';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { ExtArchive } from '@app/core/models/extArchive.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Source } from '@app/core/models/source.model';
import { SupportSource } from '@app/core/models/supportSource.model';
import { Task } from '@app/core/models/task.model';
import { UploadSource } from '@app/core/models/uploadSource.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { SourceService } from '@app/core/services/source.service';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { ErrorResult } from '@app/core/utils/models/errorResult.model';
import { UtilService } from '@app/core/utils/util.service';
import { ValidationService } from '@app/core/utils/validation.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { Cheque } from '@app/core/models/cheque.model';

@Component({
    selector: 'app-source',
    templateUrl: 'source.component.html',
})
export class SourceComponent implements OnInit {
    @Input() task: Task;
    @Input() viewSource: boolean;
    @Input() formVariables: FormVariables;
    @Input() sources: Source[];
    @Output() saveButtonClicked = new EventEmitter<UploadSource>();
    @Output() cancelButtonClicked = new EventEmitter<boolean>();
    @Output() selectedDocumentChange: EventEmitter<any> = new EventEmitter<any>();
    titleTooltip :string;
    rowSizes: any = RowSizes;
    message: any;
    errorMessage: string;
    types: SelectItem[];
    mainTypes: SelectItem[];
    type = SourceTypes;
    availabilityStatuses: SelectItem[];
    sourceTypes: SelectItem[];
    supportSource: SupportSource;
    cheque: Cheque;
    administrativeSource: AdministrativeSource;
    locale: any;
    noFileUploaded: boolean;
    displayObj: any = {};
    hasAdministrativeSource;
    _selectedDocument: any;


    constructor(
        public codeListService: CodeListService,
        protected utilService: UtilService,
        protected alertService: AlertService,
        protected validationService: ValidationService,
        protected sourceService: SourceService,
        private transactionInstanceService: TransactionInstanceService,
        private route: ActivatedRoute,
        private translateService: TranslateService,
        private transactionInstanceHistoryService: TransactionHistoryService
    ) {}

    get selectedDocument(): any {
        return this._selectedDocument;
    }

    @Input()
    set selectedDocument(selectedDocument: any) {
        if (!selectedDocument) {
            this.viewSource = false;
            this.errorMessage = null;
            this.cancelButtonClicked.emit(true);
        }
        this._selectedDocument = selectedDocument;
    }

    ngOnInit(): void {
        this.titleTooltip=this.translateService.instant('SOURCES.TITLE_LIST');
        this.getTypes();
        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
        const urlParams: Observable<any> = this.route.params;

        this.hasAdministrativeSource =
            this.sources &&
            this.sources.filter((source) => source.sourceType === SourceTypes.ADMINISTRATIVE_SOURCE).length > 0;

        urlParams.subscribe((params) => {
            const sourceId = params.sourceId ? params.sourceId : this.selectedDocument.id;
            if (sourceId) {
                this.sourceService.getSourceByID(sourceId).subscribe(
                    (val: Source) => {
                        this.selectedDocument = new UploadSource();
                        this.selectedDocument.source = val;
                        this.onViewSource();
                    },
                    (err) => {
                        this.alertService.apiError(err);
                        this.cancel();
                    },
                );
            }
        });
    }
    // either on same page or in new window
    onViewSource() {
        if (this.viewSource) {
            this.sourceService.getDocumentById(this.selectedDocument.source).subscribe(
                (val) => {
                    const extArchive = new ExtArchive(this.selectedDocument.source.extArchive);
                    this.displayObj.file = window.URL.createObjectURL(val);
                    this.displayObj.rawContent = val;
                    this.displayObj.fileName = extArchive.fileName;
                    this.displayObj.sourceId = this.selectedDocument.source.id;
                    this.displayObj.viewerProp = Utils.getFileMimeType(extArchive.fileName);
                    if (!this.displayObj.viewerProp.type) {
                        this.cancel();
                        this.alertService.warning('MESSAGES.FILE_VIEWER_ERROR');
                    }
                },
                (err) => {
                    this.alertService.apiError(err);
                    this.cancel();
                },
            );
        }
    }

    cancel() {
        this.selectedDocument = null;
    }

    // get code and source type translated
    getTypes(): void {
        this.utilService
            .mapToSelectItems(
                this.codeListService.getCodeLists({ type: CodeListTypes.ADMINISTRATIVE_SOURCE_TYPE }),
                'CODELIST.VALUES',
                'value.value',
                'COMMON.ACTIONS.SELECT',
            )
            .subscribe((types: SelectItem[]) => {
                this.types = types;
            });

        this.utilService
            .mapToSelectItems(
                this.codeListService.getCodeLists({ type: CodeListTypes.AVAILABILITY_STATUS_TYPE }),
                'CODELIST.VALUES',
                'value.value',
                'COMMON.ACTIONS.SELECT',
            )
            .subscribe((availabilityStatuses: SelectItem[]) => {
                this.availabilityStatuses = availabilityStatuses;
            });

        this.utilService
            .mapToSelectItems(
                this.codeListService.getCodeLists({ type: CodeListTypes.PRESENTATION_FORM_CODE_TYPE }),
                'CODELIST.VALUES',
                'value.value',
                'COMMON.ACTIONS.SELECT',
            )
            .subscribe((mainTypes: SelectItem[]) => {
                this.mainTypes = mainTypes;
            });

        this.utilService
            .mapToSelectItems(this.sourceService.getAllSourceTypes(), 'SOURCE.TYPES', 'value', 'COMMON.ACTIONS.SELECT')
            .subscribe(
                (sourceTypes: SelectItem[]) => {
                    this.sourceTypes = sourceTypes;
                },
                (err) => this.alertService.apiError(err),
            );
    }

    uploadDocument(event) {
        this.selectedDocument.file = event.files[0];
        this.noFileUploaded = false;
    //     for(let file of event.files) {
    //         this.selectedDocument.file.push(file);
    // }
   
    }

    removeDocument() {
        this.selectedDocument.file = null;
        this.noFileUploaded = true;
    }

    saveDocument(uploadDocument: UploadSource, form: NgForm) {
        this.noFileUploaded = !uploadDocument.file && !uploadDocument.source.id;

        const errorMessage = this.validateSourceForm(uploadDocument, form, this.validationService);
        if (errorMessage) {
            return (this.errorMessage = new ErrorResult(errorMessage).toMessage());
        }

        this.utilService.displayConfirmationDialog('SOURCES.CONFIRM_MESSAGE', () => {
            this.saveDocumentAction(uploadDocument, form);
        });
    }

    saveDocumentAction(uploadDocument: UploadSource, form: NgForm) {
        if (!this.task) {
            uploadDocument.folderName = '';
            this.done(uploadDocument);
        } else if (this.task.processInstanceId) {
            this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => {
                    this.transactionInstanceService.getTransactionInstancesByWorkflowId(id).subscribe(
                        (transactionInstance) => {
                            uploadDocument.folderName = transactionInstance.id;
                            uploadDocument.source.transactionInstance = transactionInstance;
                            this.done(uploadDocument);
                        },
                        (err) => this.alertService.apiError(err),
                    );
                })
                .catch((err) => this.alertService.apiError(err));
        }
    }

    private validateSourceForm(
        uploadDocument: UploadSource,
        form: NgForm,
        validationService: ValidationService,
    ): string {
        if (form.invalid) {
            const errorResult = validationService.validateForm(form);
            return errorResult.message;
        }

        if (!uploadDocument.file && !uploadDocument.source.id) {
            return 'MESSAGES.FILE_UPLOAD_MANDATORY';
        }

        const errorMessage = this.validateSourceTypeExtraFields(uploadDocument);
        if (errorMessage) {
            return errorMessage;
        }

        return '';
    }

    private validateSourceTypeExtraFields(uploadDocument: UploadSource): string {
        if (uploadDocument.source.sourceType === this.type.SUPPORT_SOURCE) {
            if (_.isEmpty(uploadDocument.source.comments)) {
                return 'MESSAGES.MANDATORY_FIELDS_ERROR';
            }
        }

        if (uploadDocument.source.sourceType === this.type.ADMINISTRATIVE_SOURCE) {
            if (_.isEmpty(uploadDocument.source.type)) {
                return 'MESSAGES.MANDATORY_FIELDS_ERROR';
            }
        }
        if (uploadDocument.source.sourceType === this.type.CHEQUE) {
            if (
                _.isEmpty(uploadDocument.source.chequeNumber) ||
                uploadDocument.source.amount == null ||
                _.isEmpty(uploadDocument.source.institution) ||
                _.isEmpty(uploadDocument.source.cardholder)
            ) {
                return 'MESSAGES.MANDATORY_FIELDS_ERROR';
            }
        }
    }

    showSourceType(type) {
        return this.selectedDocument.source.sourceType === type;
    }

    done(uploadDocument: UploadSource) {
        this.selectedDocument = null;
        this.saveButtonClicked.emit(uploadDocument);
    }


}
