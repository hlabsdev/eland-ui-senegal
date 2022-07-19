import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';
import { CodeList } from '@app/core/models/codeList.model';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { NgxUiLoaderService } from 'ngx-ui-loader';
@Component({
    selector: 'app-restriction-types',
    templateUrl: 'restrictionTypes.component.html',
})
export class RestrictionTypesComponent implements OnInit {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onAdd = new EventEmitter(true);
    restrictionTypes: CodeList[];
    search: string;
    rowSizes: any = RowSizes;
    type = CodeListTypes.RESTRICTION_TYPE;
    codeList: CodeList;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR.CONFIG.REST_TITLE'),
        titleTooltip: this.translateService.instant('RRR.CONFIG.REST_TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'restrictionTypes',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['value'],
        actions: [{
            type: 'edit',
            callback: 'editRestrictionType',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private codeListService: CodeListService,
        private alertService: AlertService,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'value', header: this.translateService.instant('RRR.RESTRICTION.VALUE'), sortable: true, filterable: true, type: 'text' }
        ];
        this.getRestrictionTypes();
    }

    getRestrictionTypes(search = '') {
        this.ngxLoader.start();
        const args = {
            search,
            type: this.type,
        };
        this.codeListService.getCodeLists(args).subscribe(
            (result) => {
                this.ngxLoader.stop();
                this.getRestrictionLabels(result);
            },
            (err) => {
                this.ngxLoader.stop();
                this.alertService.apiError(err);
            },
        );
    }

    editRestrictionType(restrictionType: CodeList): void {
        this.codeList = restrictionType;
        this.onAdd.emit(this.codeList);
    }

    addRestrictionType(): void {
        this.codeList = new CodeList();
        this.codeList.type = this.type;
        this.onAdd.emit(this.codeList);
    }

    getRestrictionLabels(values) {
        let restrictionsValues = [];

        restrictionsValues = values.map((cl) => this.translateService.get(`CODELIST.VALUES.${cl.value}`));

        forkJoin(restrictionsValues).subscribe(
            (args) => {
                values.forEach((v, i) => {
                    v.value = args[i];
                });
                this.restrictionTypes = values;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    reload(){
        this.getRestrictionTypes();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
