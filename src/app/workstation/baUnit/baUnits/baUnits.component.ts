import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { BAUnit } from '../baUnit.model';
import { BAUnitService } from '../baUnit.service';
import { Table } from 'primeng/table';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-ba-units',
    templateUrl: 'baUnits.component.html',
})
export class BAUnitsComponent implements OnInit {
    baUnits: BAUnit[];
    rowSizes: any = RowSizes;
    // default is to see only registered BaUnits.
    showOnlyRegistered = true;
    totalRecords: number;
    searchText = '';
    registeredUrl: boolean;

    tableConfig: TableConfig = {
        title: '',
        titleTooltip: '',
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'ba-units',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['registryRecord.titleId', 'registryRecord.volume', 'registryRecord.folio', 'type.description', 'owner'],
        actions: [{
            type: 'custom',
            callback: 'custom',
        }]
    }

    cols: TableCols[] = [];


    // preloader message
    preloaderMessage = '...';

    constructor(
        private BAUnitservice: BAUnitService,
        private router: Router,
        private route: ActivatedRoute,
        private alertService: AlertService,
        private translateService: TranslateService,
        private ngxLoader: NgxUiLoaderService,
    ) {}

    ngOnInit(): void {
        this.registeredUrl = this.router.url === '/ba-units/registered';
        if(this.registeredUrl){
            this.tableConfig.title = this.translateService.instant('HEADER.BA_UNITS_REGISTERED');   
            this.tableConfig.titleTooltip = this.translateService.instant('HEADER.BA_UNITS_REGISTERED');   
        } else {
            this.tableConfig.title = this.translateService.instant('BA_UNITS.TITLE_LIST');   
            this.tableConfig.titleTooltip = this.translateService.instant('BA_UNITS.TITLE_LIST');   
        }

        this.cols = [
            { field: 'registryRecord.titleId', header: this.translateService.instant('BA_UNIT.ID'), sortable: true, filterable: true, type: 'text' },
            { field: 'registryRecord.volume', header: this.translateService.instant('BA_UNIT.REGISTRY.VOLUME'), sortable: true, filterable: true, type: 'text'},
            { field: 'registryRecord.folio', header: this.translateService.instant('BA_UNIT.REGISTRY.FOLIO'), sortable: true, filterable: true, type: 'text' },
            { field: 'type.description', header: this.translateService.instant('BA_UNIT.TYPE'), sortable: true, filterable: true, type: 'text' },
            // Hide field just for the demo
            // { field: 'parties.length', header: this.translateService.instant('BA_UNIT.PARTIES') },
            // { field: 'rrrs.length', header: this.translateService.instant('BA_UNIT.RRR') },
            // { field: 'spatialUnits.length', header: this.translateService.instant('BA_UNIT.SPATIAL_UNITS') },
            { field: 'owner', header: this.translateService.instant('BA_UNIT.OWNER'), sortable: true, filterable: true, type: 'text' },
        ];
        
        this.route.queryParams.subscribe((params) => {
            this.showOnlyRegistered = params && params.all ? false : true;
        });
        this.loadBAUnits();
    }

    searchBaUnits() {
        this.loadBAUnits();
    }

    loadBAUnits(event: LazyLoadEvent = {}) {
        const args = {
            page: event.first / event.rows,
            perPage: this.rowSizes.SMALL,
            orderBy: event.sortField,
            direction: event.sortOrder,
            search: this.searchText,
        };

        const getBaUnits = this.showOnlyRegistered
            ? this.BAUnitservice.getRegisteredBAUnits(args)
            : this.BAUnitservice.getBAUnits(args);

        getBaUnits.subscribe(
            (result) => {
                // preloading init
                this.ngxLoader.start();

                this.baUnits = result.content;
                this.totalRecords = result.totalElements;

                // setting the preloader message
                this.preloaderMessage = this.getPreloaderMessage();
                // stopping the preloading
                this.ngxLoader.stop();
            },
            (err) => this.alertService.apiError(err),
        );
    }

    getPreloaderMessage() {
        if (this.baUnits.length === 0) {
            return '...';
        } else if (this.baUnits.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.baUnits.length +
                ' ' +
                this.translateService.instant('PRELOADER.BA_UNIT') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.baUnits.length +
                ' ' +
                this.translateService.instant('PRELOADER.BA_UNITS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    editBAUnit(baUnit: BAUnit): void {
        const params = { queryParams: { registered: this.showOnlyRegistered } };
        this.router.navigate(['ba-unit', baUnit.uid], params);
    }

    addBAUnit(): void {
        this.router.navigate(['ba-unit']);
    }

    reload(){
        this.loadBAUnits();
    }
}
