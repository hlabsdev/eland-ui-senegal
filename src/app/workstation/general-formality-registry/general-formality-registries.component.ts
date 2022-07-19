import { Component, OnInit } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { GeneralFormalityRegistryService } from '@app/core/services/generalFormalityRegistry.service';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { TranslateService } from '@ngx-translate/core';
import { BAUnitService } from '../baUnit/baUnit.service';
import { LazyLoadEvent } from 'primeng/api';
import { GeneralFormalityRegistry } from '@app/core/models/generalFormalityRegistry.model';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-general-formality-registries',
    templateUrl: './general-formality-registries.component.html',
})
export class GeneralFormalityRegistriesComponent implements OnInit {
    generalFormalityRegisterUrl: boolean;
    generalFormalityRegister: GeneralFormalityRegistry[];
    rowSizes: any = RowSizes;
    totalRecords: number;
    searchText = '';
    minSearchCharCount: number;
    // preloader message
    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.TITLE_FORM'),
        titleTooltip: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.TITLE_FORM'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'generalFormalityRegistry',
        displayAction: false,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['depositDate', 'depositVolume', 'depositFolio', 'depositNumber', 'entryNumber', 'observation', 'registrationFees'],
    }

    cols: TableCols[] = [];

    constructor(
        private generalFormalityRegisterService: GeneralFormalityRegistryService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
        protected translateService: TranslateService,
        protected baUnitService: BAUnitService,
    ) {}

    ngOnInit(): void {
        this.generalFormalityRegisterUrl = this.router.url === '/generalFormalityRegistries';
        this.minSearchCharCount = 3;

        this.cols = [
            { field: 'depositDate', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.DATE'), sortable: true, filterable: true, type: 'date', width: '7%' },
            { field: 'depositVolume', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.DEPOSIT_VOLUME'), sortable: true, filterable: true, type: 'text', width: '12.5%' },
            { field: 'depositFolio', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.DEPOSIT_FOLIO'), sortable: true, filterable: true, type: 'text', width: '12.5%' },
            { field: 'depositNumber', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.DEPOSIT_NUMBER'), sortable: true, filterable: true, type: 'date', width: '12.5%' },
            { field: 'entryNumber', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.ENTRY_NUMBER'), sortable: true, filterable: true, type: 'text', width: '9%' },
            { field: 'observation', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.OBSERVATION'), sortable: true, filterable: true, type: 'text', width: '20%' },
            { field: 'registrationFees', header: this.translateService.instant('GENERAL_FORMALITY_REGISTRY.REGISTRATION_FEES'), sortable: true, filterable: true, type: 'text', width: '12.5%' },
        ];

        this.loadRegistry();
    }

    loadRegistry(event: LazyLoadEvent = {}) {
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

        this.generalFormalityRegisterService.getGeneralFormalityRegistry(args).subscribe((result) => {
            // preloading init
            this.ngxLoader.start();

            this.generalFormalityRegister = result.content;

            this.totalRecords = result.totalElements;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();
        });
    }

    getPreloaderMessage() {
        if (this.generalFormalityRegister.length === 0) {
            return '...';
        } else if (this.generalFormalityRegister.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.generalFormalityRegister.length +
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
                this.generalFormalityRegister.length +
                ' ' +
                this.translateService.instant('PRELOADER.RDAIS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    reload(){
        this.loadRegistry();
    }
}
