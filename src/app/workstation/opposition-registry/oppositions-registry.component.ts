import { Component, OnInit } from '@angular/core';
import { OppositionRegistry } from '@app/core/models/oppositionRegistry.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { OppositionRegistryService } from '@app/core/services/oppositionRegistry.service';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { BAUnitService } from '../baUnit/baUnit.service';
import { LazyLoadEvent } from 'primeng/api';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-oppositions-registry',
    templateUrl: './oppositions-registry.component.html',
})
export class OppositionsRegistryComponent implements OnInit {
    oppositionregistrysUrl: boolean;
    oppositionsregistry: OppositionRegistry[];
    rowSizes: any = RowSizes;
    totalRecords: number;
    searchText = '';
    minSearchCharCount: number;

    // preloader message
    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('OPPOSITION_REGISTRY.TITLE_FORM'),
        titleTooltip: this.translateService.instant('OPPOSITION_REGISTRY.TITLE_FORM'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'oppositionsRegistry',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['depositDate', 'entryNumber', 'observation', 'releaseNotice'],
    }

    cols: TableCols[] = [];

    constructor(
        private oppositionRegistryService: OppositionRegistryService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
        protected translateService: TranslateService,
        protected baUnitService: BAUnitService,
    ) {}

    ngOnInit(): void {
        this.oppositionregistrysUrl = this.router.url === '/oppositionsregistry';
        this.minSearchCharCount = 3;

        this.cols = [
            { field: 'depositDate', header: this.translateService.instant('OPPOSITION_REGISTRY.DATE'), sortable: true, filterable: true, type: 'date', width: '7%' },
            { field: 'entryNumber', header: this.translateService.instant('OPPOSITION_REGISTRY.ENTRY_NUMBER'), sortable: true, filterable: true, type: 'text', width: '9%' },
            { field: 'observation', header: this.translateService.instant('OPPOSITION_REGISTRY.OBSERVATION'), sortable: true, filterable: true, type: 'text', width: '30%' },
            { field: 'releaseNotice', header: this.translateService.instant('OPPOSITION_REGISTRY.RELEASENOTICE'), sortable: true, filterable: true, type: 'date', width: '12.5%' },
        ];
        this.loadOppositionsRegistry();
    }

    loadOppositionsRegistry(event: LazyLoadEvent = {}) {
        if (this.searchText.length > 0 && this.searchText.length < this.minSearchCharCount) {
            return;
        }

        const args = {
            page: event.first / event.rows,
            perPage: event.rows ? event.rows : this.rowSizes.SMALL,
            orderBy: event.sortField,
            direction: event.sortOrder,
            search: this.searchText,
        };

        this.oppositionRegistryService.getOppositionsRegistry(args).subscribe((result) => {
            // preloading init
            this.ngxLoader.start();

            this.oppositionsregistry = result.content;
            this.totalRecords = result.totalElements;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();
        });
    }

    getPreloaderMessage() {
        if (this.oppositionsregistry.length === 0) {
            return '...';
        } else if (this.oppositionsregistry.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.oppositionsregistry.length +
                ' ' +
                this.translateService.instant('PRELOADER.RDAI') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.oppositionsregistry.length +
                ' ' +
                this.translateService.instant('PRELOADER.RDAIS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    reload(){
        this.loadOppositionsRegistry();
    }
}
