import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { CodeListService } from '@app/core/services/codeList.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { CodeList } from '@app/core/models/codeList.model';
import { forkJoin } from 'rxjs';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-right-types',
    templateUrl: 'rightTypes.component.html',
})
export class RightTypesComponent implements OnInit {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onAdd = new EventEmitter(true);
    codeList: CodeList;
    rightTypes: CodeList[];
    search: string;
    rowSizes: any = RowSizes;
    type = CodeListTypes.RIGHT_TYPE;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR.CONFIG.RIGHT_TITLE'),
        titleTooltip: this.translateService.instant('RRR.CONFIG.RIGHT_TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'rightTypes',
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
            callback: 'editRightType',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private codeListService: CodeListService,
        private router: Router,
        private alertService: AlertService,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'value', header: this.translateService.instant('RRR.RIGHT.VALUE'), sortable: true, filterable: true, type: 'text' }
        ];
        this.getRightTypes();
    }

    getRightTypes(search: string = null) {
        this.ngxLoader.start();
        const args = {
            search,
            type: this.type,
        };
        this.codeListService.getCodeLists(args).subscribe(
            (result) => {
                this.getRightLabels(result);
                this.ngxLoader.stop();
            },
            (err) => {
                this.ngxLoader.stop();
                this.alertService.apiError(err);
            },
        );
    }

    editRightType(rightType: CodeList): void {
        this.codeList = rightType;
        this.onAdd.emit(this.codeList);
    }

    addRightType(): void {
        this.codeList = new CodeList();
        this.codeList.type = this.type;
        this.onAdd.emit(this.codeList);
    }

    getRightLabels(values) {
        let rightsValues = [];

        rightsValues = values.map((cl) => this.translateService.get(`CODELIST.VALUES.${cl.value}`));

        forkJoin(rightsValues).subscribe(
            (args) => {
                values.forEach((v, i) => {
                    v.value = args[i];
                });
                this.rightTypes = values;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    reload(){
        this.getRightTypes();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
