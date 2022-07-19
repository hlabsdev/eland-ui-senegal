import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CodeList } from '@app/core/models/codeList.model';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { CodeListService } from '@app/core/services/codeList.service';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-responsibility-types',
    templateUrl: 'responsibilityTypes.component.html',
})
export class ResponsibilityTypesComponent implements OnInit {
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onAdd = new EventEmitter(true);
    responsibilityTypes: CodeList[];
    search: string;
    rowSizes: any = RowSizes;
    pickerDisplay: boolean;
    type = CodeListTypes.RESPONSIBILITY_TYPE;
    codeList: CodeList;

    tableConfig: TableConfig = {
        title: this.translateService.instant('RRR.CONFIG.RESP_TITLE'),
        titleTooltip: this.translateService.instant('RRR.CONFIG.RESP_TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'responsibilityTypes',
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
            callback: 'editResponsibilityType',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private router: Router,
        private codeListService: CodeListService,
        private alertService: AlertService,
        private translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.cols = [
            { field: 'value', header: this.translateService.instant('RRR.RESPONSIBILITY.VALUE'), sortable: true, filterable: true, type: 'text' }
        ];
        this.getResponsibilityTypes();
    }

    getResponsibilityTypes(search = '') {
        const args = {
            search,
            type: this.type,
        };
        this.codeListService.getCodeLists(args).subscribe(
            (result) => this.getResponsabilityLabels(result),
            (err) => this.alertService.apiError(err),
        );
    }

    editResponsibilityType(responsibilityType: CodeList): void {
        this.codeList = responsibilityType;
        this.onAdd.emit(this.codeList);
    }

    addResponsibilityType(): void {
        this.codeList = new CodeList();
        this.codeList.type = this.type;
        this.onAdd.emit(this.codeList);
    }

    getResponsabilityLabels(values) {
        let restrictionsValues = [];

        restrictionsValues = values.map((cl) => this.translateService.get(`CODELIST.VALUES.${cl.value}`));

        forkJoin(restrictionsValues).subscribe(
            (args) => {
                values.forEach((v, i) => {
                    v.value = args[i];
                });
                this.responsibilityTypes = values;
            },
            (err) => this.alertService.apiError(err),
        );
    }

    reload(){
        this.getResponsibilityTypes();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
