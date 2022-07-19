import {
    AfterViewInit,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    OnInit,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { CodeListService } from '@app/core/services/codeList.service';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { Application } from '@app/core/models/application.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { ApplicationService } from '@app/core/services/application.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Dialog } from 'primeng/dialog';
import { SelectItem } from 'primeng/api';
import { FormVariables } from '../baseForm/formVariables.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { DialogConfig } from '@app/core/models/dialogConfig';

@Component({
    selector: 'app-applications',
    templateUrl: 'applications.component.html',
})
export class ApplicationsComponent implements OnInit, AfterViewInit {
    applications: Application[];
    rowSizes: any = RowSizes;
    application: Application = null;
    totalRecords: number;
    searchApplicationNumber = '';
    searchReferenceNumber = '';
    searchApplicationPurpose = '';
    searchDisplayFullName = '';
    searchApplicationDate = '';
    searchstatusFormat = '';
    searchStatusCodeList = '';
    locale: any;
    today: Date;
    yearRange: string;
    date1: Date;
    mainTypes: SelectItem[];

    @ViewChild('dataTableApplications') table: Table;

    // preloader message
    preloaderMessage = '...';

    dialogConfig: DialogConfig;

    tableConfig: TableConfig = {
        title: this.translateService.instant('APPLICATION.TITLE_LIST'),
        titleTooltip: this.translateService.instant('APPLICATION.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'applications',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['applicationNumber', 'referenceNumber', 'applicant.displayName', 'applicationDate', 'applicationPurpose', 'status', 'applicantType'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];

    @ViewChild('lazyApplication', { read: ViewContainerRef })
    private lazyApplicationVcRef: ViewContainerRef;

    constructor(
        public codeListService: CodeListService,
        private applicationService: ApplicationService,
        private translateService: TranslateService,
        private changeDetector: ChangeDetectorRef,
        protected utilService: UtilService,
        private ngxLoader: NgxUiLoaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {
        this.getTypes();
        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
        this.today = new Date();
        this.yearRange = `1900:${new Date().getFullYear().toString()}`;
        this.cols = [
            { field: 'applicationNumber', header: this.translateService.instant('APPLICATION.NUMBER'), sortable: true, filterable: true, type: 'text' },
            { field: 'referenceNumber', header: this.translateService.instant('APPLICATION.REFERENCE_NUMBER'), sortable: true, filterable: false, type: 'text' },
            { field: 'applicant.displayName',  header: this.translateService.instant('APPLICATION.REQUEST_NAME'), sortable: true, filterable: true, type: 'text' },
            { field: 'applicationDate', header: this.translateService.instant('APPLICATION.DATE'), sortable: true, filterable: false, type: 'date' },
            { field: 'applicationPurpose', header: this.translateService.instant('APPLICATION.PURPOSE'), sortable: true, filterable: false, type: 'text' },
            { field: 'status', header: this.translateService.instant('APPLICATION.REQUEST_STATUS'), sortable: true, filterable: false, type: 'text' },
            { field: 'applicantType', subField: 'type', header: this.translateService.instant('APPLICATION.REQUESTER_TYPE'), sortable: true, filterable: false, type: 'text' },
        ];
        this.loadApplications();
    }

    cancelApplication() {
        this.application = null;
    }

    showApplicantDialogue(application = null): void {
        this.application = application;
        this.dialogConfig = {
            display: true,
            showAction: false,
            title: this.translateService.instant('APPLICATION.APPLICATION'),
            canSave: false,
            tabs: [
                { name: this.translateService.instant('APPLICATION.APPLICATION'), required: true },
            ]
        };
        this.lazyLoadApplication();
    }

    loadApplications(event: LazyLoadEvent = {}) {
        const args = {
            page: event.first / event.rows,
            perPage: event.rows ? event.rows : this.rowSizes.SMALL,
            orderBy: event.sortField,
            direction: event.sortOrder,
            searchAppNum: this.searchApplicationNumber,
            searchRefNum: this.searchReferenceNumber,
            searchAppPurpose: this.searchApplicationPurpose,
            searchFullName: this.searchDisplayFullName,
            searchAppDate: this.searchApplicationDate ? this.searchApplicationDate : '',
            searchStatus: this.searchStatusCodeList ? this.searchStatusCodeList : '',
        };

        this.applicationService.getApplications(args).subscribe((result) => {
            // preloading init
            this.ngxLoader.start();
            this.tableConfig.loading = true;

            this.applications = result.content;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();
            this.tableConfig.loading = false;

            this.totalRecords = result.totalElements;
        });
    }

    getPreloaderMessage() {
        if (this.applications.length === 0) {
            return '...';
        } else if (this.applications.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.applications.length +
                ' ' +
                this.translateService.instant('PRELOADER.APPLICATION') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.applications.length +
                ' ' +
                this.translateService.instant('PRELOADER.APPLICATIONS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    reCenterDialog(dialog: Dialog) {
        // setTimeout(() => dialog.center(), 300);
    }

    ngAfterViewInit(): void {
        this.changeDetector.detectChanges();
    }

    getTypes(): void {
        this.utilService
            .mapToSelectItems(
                this.applicationService.getApplicationStatus(),
                'APPLICATION.STATUS',
                'value',
                'COMMON.ACTIONS.STATUS',
            )
            .subscribe((mainTypes: SelectItem[]) => {
                this.mainTypes = mainTypes;
            });
    }

    async lazyLoadApplication() {
        const { ApplicationComponent } = await import('./application/application.component');
        if (this.application && this.application.id) {
            setTimeout(() => {
                this.lazyApplicationVcRef.clear();
                const application = this.lazyApplicationVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ApplicationComponent),
                );
                application.instance.formVariables = new FormVariables({
                    isReadOnly: true,
                });
                application.instance.applicationView = this.application;
                application.instance.readOnly = true;
                application.instance.canceled.subscribe(() => {
                    this.cancelApplication();
                });
            }, 100);
        }
    }

    reload(){
        this.loadApplications();
    }

}
