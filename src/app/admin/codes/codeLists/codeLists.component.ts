import { map, mergeMap } from 'rxjs/operators';
import {
    Component,
    EventEmitter,
    OnInit,
    Output,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { CodeList } from '@app/core/models/codeList.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { ConfirmationService, SelectItem } from 'primeng/api';
import { forkJoin, of } from 'rxjs';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-code-lists',
    templateUrl: 'codeLists.component.html',
    styleUrls: ['./codeLists.component.scss'],
})
export class CodeListsComponent implements OnInit {
    @Output() added = new EventEmitter(true);
    codeLists: CodeList[];
    search: string;
    rowSizes: any = RowSizes;
    typeFilter: number;
    typeTimeout: any;
    codeListTypes: SelectItem[];
    receivedCodeList: CodeList;
    type = CodeListTypes.RIGHT_TYPE;

    // preloader message
    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('CODELIST.TITLE_LIST'),
        titleTooltip: this.translateService.instant('CODELIST.TITLE_LIST'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'codeLists',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['value', 'description', 'type'],
        actions: [{
            type: 'edit',
            callback: 'editCodeList',
        },{
            type: 'delete',
            callback: 'deleteCodeList',
        }]
    }

    cols: TableCols[] = [];

    @ViewChild('lazyCodeList', { read: ViewContainerRef })
    private lazyCodeListVcRef: ViewContainerRef;

    constructor(
        private codelistservice: CodeListService,
        private router: Router,
        public utilService: UtilService,
        private alertService: AlertService,
        protected translateService: TranslateService,
        private route: ActivatedRoute,
        private ngxLoader: NgxUiLoaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'value', header: this.translateService.instant('CODELIST.VALUE'), sortable: true, filterable: true, type: 'text' },
            { field: 'description', header: this.translateService.instant('CODELIST.DESCRIPTION'), sortable: true, filterable: true, type: 'text' },
            { field: 'type', header: this.translateService.instant('CODELIST.TYPE'), sortable: true, filterable: true, type: 'text' },
        ];
        
        this.getCodeLists();
    }

    editCodeList(codeList: CodeList): void {
        this.receivedCodeList = codeList;
        this.added.emit(this.receivedCodeList);
        setTimeout(() => {
            this.lazyLoadCodeList();
        }, 100);
    }

    addCodeList(): void {
        this.receivedCodeList = new CodeList();
        this.receivedCodeList.codeListID = ' ';
        this.added.emit(this.receivedCodeList);

        setTimeout(() => {
            this.lazyLoadCodeList();
        }, 100);
    }

    async lazyLoadCodeList() {
        this.lazyCodeListVcRef.clear();
        const { CodeListComponent } = await import('../codeList/codeList.component');
        const codeList = this.lazyCodeListVcRef.createComponent(this.cfr.resolveComponentFactory(CodeListComponent));

        codeList.instance.codeList = this.receivedCodeList;
        codeList.instance.sourceRRRconfig = false;
        codeList.instance.onClose.subscribe(() => {
            this.closeDialog();
        });
        codeList.instance.refresh.subscribe((data) => {
            this.refresh(data);
        });
    }

    closeDialog() {
        this.receivedCodeList = null;
        this.getCodeLists();
    }

    getCodeLists(search = '') {
        const args = {
            search,
        };
        this.getCodeList(args);
    }

    getCodeList(args = {}) {
        this.codelistservice.getCodeLists(args).subscribe(
            (value) => this.getCodeListLabels(value),
            (err) => this.alertService.apiError(err),
        );
    }

    refresh(event = {}) {
        this.getCodeList();
    }

    getCodeListLabels(values) {
        let labels = [];
        let codeListValues = [];

        labels = values.map((cl) => this.translateService.get(`CODELIST.TYPES.${cl.type}`));

        forkJoin(labels).subscribe(
            (args) => {
                values.forEach((v, i) => {
                    v.type = args[i];
                });

                // preloading init
                this.ngxLoader.start();

                this.codeLists = values;

                // setting the preloader message
                this.preloaderMessage = this.getPreloaderMessage();

                // stopping the preloading
                this.ngxLoader.stop();
            },
            (err) => this.alertService.apiError(err),
        );

        codeListValues = values.map((cl) => this.translateService.get(`CODELIST.VALUES.${cl.value}`));

        forkJoin(codeListValues).subscribe(
            (args) => {
                values.forEach((v, i) => {
                    v.value = args[i];
                });
                this.codeLists = values;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    getPreloaderMessage() {
        if (this.codeLists.length === 0) {
            return '...';
        } else if (this.codeLists.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.codeLists.length +
                ' ' +
                this.translateService.instant('PRELOADER.CODE') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.codeLists.length +
                ' ' +
                this.translateService.instant('PRELOADER.CODES') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    reload(){
        this.getCodeLists();
    }
   
    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }

    deleteCodeList(codeList: CodeList) {
        const onAccept = of(this.codelistservice.deleteCodeList(codeList.codeListID)).pipe(
            mergeMap(() => of(this.refresh()).pipe(map(() => this.closeDialog()))),
        );

        return this.utilService.displayConfirmationDialogWithMessageParameters(
            'MESSAGES.CONFIRM_DELETE_DATA',
            { parameter: codeList.value },
            () => onAccept.subscribe((success) => this.alertService.success('API_MESSAGES.SAVE_SUCCESSFUL')),
        );
    }
}
