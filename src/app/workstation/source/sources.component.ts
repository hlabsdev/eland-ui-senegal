import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { SourceService } from '@app/core/services/source.service';
import { TransactionInstanceService } from '@app/core/services/transactionInstance.service';
import { TranslateService } from '@ngx-translate/core';
import { TransactionHistoryService } from '@app/core/services/transactionHistory.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Variables } from '@app/core/models/variables.model';
import { Source } from '@app/core/models/source.model';
import { UploadSource } from '@app/core/models/uploadSource.model';
import { Task } from '@app/core/models/task.model';
import { mergeMap, catchError, map } from 'rxjs/operators';
import { Location } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormTemplateBaseComponent } from '../baseForm/form-template-base.component';
import { combineLatest } from 'rxjs';
import { saveAs } from 'file-saver';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import * as _ from 'lodash';
import { LazyLoadEvent } from 'primeng/api';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-sources',
    templateUrl: 'sources.component.html',
})
export class SourcesComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() task: Task;
    @Output() saved = new EventEmitter<{ val: string[]; variable: Variables }>();
    @Output() canceled = new EventEmitter<boolean>();
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() showBaUnitSourcesDetail = false;
    @Input() displayingHistory = false;

    sourcesUrl: boolean;
    sources: Source[];
    sourcesToShow: Source[];
    sourceIDs: string[];
    accessedByRouter: boolean;
    rowSizes: any = RowSizes;
    selectedDocument: UploadSource;
    source: Source = new Source();
    sourceBackup: Source[];
    baUnitId: string;
    label: string;
    displaySource = false;
    totalRecords: number;

    tableConfig: TableConfig = {
        title: this.translateService.instant('SOURCES.TITLE_LIST'),
        titleTooltip: this.translateService.instant('SOURCES.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'sources',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: false,
        searchBarField: ['mainType.description', 'sourceType', 'submissionDate', 'extArchive.fileName', 'transactionInstance.transaction.name'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        protected location: Location,
        private router: Router,
        private alertService: AlertService,
        protected sourceService: SourceService,
        protected route: ActivatedRoute,
        private translateService: TranslateService,
        private transactionInstanceService: TransactionInstanceService,
        private transactionInstanceHistoryService: TransactionHistoryService,
        private ngxLoader: NgxUiLoaderService,
    ) {
        super();
    }

    ngOnInit(): void {
        this.sourcesUrl = this.router.url === '/sources';
        this.baUnitId = this.formVariables.baUnit && this.formVariables.baUnit.uid;

        this.sourceIDs = this.formVariables.sources ? this.formVariables.sources : [];
        combineLatest([this.route.params, this.route.queryParams, this.route.url])
            .pipe(map((results) => ({ params: results[0], queryParams: results[1], urlPath: results[2] })))
            .subscribe((route) => {
                if (route.urlPath.find((p) => p.path === 'sources')) {
                    this.accessedByRouter = true;
                }
            });

        if (this.showBaUnitSourcesDetail) {
            this.cols = [
                { field: 'mainType.description', header: this.translateService.instant('SOURCE.MAIN_TYPE'), sortable: true, filterable: true, type: 'text' },
                { field: 'sourceType', header: this.translateService.instant('SOURCE.SOURCE_TYPE'), sortable: true, filterable: true, type: 'text' },
                { field: 'submissionDate', header: this.translateService.instant('SOURCE.SUBMISSION_DATE'), sortable: true, filterable: true, type: 'text' },
                { field: 'extArchive.fileName', header: this.translateService.instant('SOURCE.FILE_NAME'), sortable: true, filterable: true, type: 'text' },
                { field: 'transactionInstance.transaction.name', header: this.translateService.instant('TRANSACTION_INSTANCE.TRANSACTION_NAME'), sortable: true, filterable: true, type: 'text' },
            ];
        } else {
            this.cols = [
                { field: 'mainType.description', header: this.translateService.instant('SOURCE.MAIN_TYPE'), sortable: true, filterable: true, type: 'text' },
                { field: 'sourceType', header: this.translateService.instant('SOURCE.SOURCE_TYPE'), sortable: true, filterable: true, type: 'text' },
                { field: 'submissionDate', header: this.translateService.instant('SOURCE.SUBMISSION_DATE'), sortable: true, filterable: true, type: 'text' },
                { field: 'extArchive.fileName', header: this.translateService.instant('SOURCE.FILE_NAME'), sortable: true, filterable: true, type: 'text' },
            ];
        }
        this.tableConfig.customData = {
            'showBaUnitSourcesDetail' : this.showBaUnitSourcesDetail,
            'formVariables' : this.formVariables,
            'sourcesUrl' : this.sourcesUrl
        };

        this.tableConfig.addBtn = this.formVariables.isReadOnly || this.sourcesUrl ? false : true;

        this.loadSourcesByPage();
    }

    // check for transactionInstance Id and using it,to get all sources.
    getSources(args: any = {}) {
        if (this.task && this.task.processInstanceId) {
            this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => {
                    this.transactionInstanceService
                        .getTransactionInstancesByWorkflowId(id)
                        .subscribe((transactionInstance) => {
                            this.findSources({ transactionInstanceId: transactionInstance.id });
                        });
                })
                .catch((err) => this.alertService.apiError(err));
        } else if (this.baUnitId) {
            this.findSources({ baUnitId: this.baUnitId });
        } else {
            this.findSources(args);
        }
    }

    findSources(args: any = {}) {
        this.sourceService.getSources(args).subscribe(
            (result) => {
                this.sources = result.content;
                this.sourcesToShow = this.sources;
                this.totalRecords = result.totalElements;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    loadSourcesByPage() {
        this.ngxLoader.start();
        if (this.task && this.task.processInstanceId) {
            this.transactionInstanceHistoryService
                .getRootProcessInstanceId(this.task.processInstanceId, this.formVariables.isFastTrackProcess)
                .then((id) => {
                    this.transactionInstanceService
                        .getTransactionInstancesByWorkflowId(id)
                        .subscribe((transactionInstance) => {
                            this.findSources({
                                transactionInstanceId: transactionInstance.id,
                            });
                        });
                })
                .catch((err) => this.alertService.apiError(err));
        } else if (this.displayingHistory && this.formVariables.baUnit.complementaryInfo.transactionInstance.id) {
            this.findSources({
                transactionInstanceId: this.formVariables.baUnit.complementaryInfo.transactionInstance.id,
            });
        } else if (this.baUnitId) {
            this.findSources({
                baUnitId: this.baUnitId,
            });
        } else {
            this.findSources();
        }
        this.ngxLoader.stop();
    }

    saveSource(source: Source = null): void {
        this.displaySource = false;
        this.selectedDocument = new UploadSource();
        this.selectedDocument.source = source ? _.cloneDeep(source) : new Source();
    }

    onSaveDocument(document: UploadSource) {
        if (!document.file && document.source.id) {
            document.source.addBAUnit(this.formVariables.baUnit);
            const updateObs = this.sourceService.updateSource(document.source);
            return updateObs.subscribe(
                (s) => {
                    this.sourceSaved(s);
                },
                (err) => this.alertService.apiError(err),
            );
        } else {
            const saveObs = this.sourceService.saveSourceFile(document);
            return saveObs
                .pipe(
                    mergeMap((result) => {
                        document.source.addBAUnit(this.formVariables.baUnit);
                        return this.sourceService.createSource(result, document.source).pipe(
                            catchError((error) => {
                                this.alertService.apiError(error);
                                return error;
                            }),
                        );
                    }),
                )
                .subscribe(
                    (s) => {
                        this.sourceSaved(s);
                    },
                    (err) => this.alertService.apiError(err),
                );
        }
    }

    downloadDocument(source: Source): void {
        const fileName = source.extArchive.fileName;
        this.sourceService.getDocumentById(source).subscribe((val) => saveAs(val, fileName));
    }

    signPdfDocument(source: Source): void {
        const baUnitId = this.baUnitId;
        const electronicSignatureRole = this.formVariables.electronicSignatureRole;
        this.sourceService.signPdfDocument(source, electronicSignatureRole, baUnitId).subscribe(
            (val) => {
                const index = _.findIndex(this.sourcesToShow, { id: val.id });
                this.sourcesToShow.splice(index, 1, val);
            },
            (err) => this.alertService.apiError(err),
        );
    }

    viewSource(source) {
        this.selectedDocument = null;
        this.displaySource = null;
        setTimeout(() => {
            this.selectedDocument = source;
            this.displaySource = true;
        }, 200);
    }

    goBack(): void {
        this.location.back();
    }

    goToList(): void {
        this.router.navigate(['sources']);
    }

    sourceSaved(s: any) {
        this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL');
        this.source = new Source(s);
        this.selectedDocument = null;
        this.sourceIDs.push(this.source.id);
        this.saved.emit({
            val: this.formVariables.sources,
            variable: {
                sources: { value: JSON.stringify(this.sourceIDs).replace('"/g', '\\"'), type: 'Json' },
            },
        });
        this.getSources();
    }

    handleCancelButton() {
        this.canceled.emit(true);
    }

    subTypeSaved() {
        this.saved.emit(null);
    }

    reload(){
        this.loadSourcesByPage();
    }
}
