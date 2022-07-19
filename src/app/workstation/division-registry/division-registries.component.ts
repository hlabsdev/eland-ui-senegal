import { Component, OnInit } from '@angular/core';
import { DivisionRegistry } from '@app/core/models/divisionRegistry.model';
import { Router } from '@angular/router';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { DivisionRegistryService } from '@app/core/services/division-registry.service';
@Component({
    selector: 'app-division-registies',
    templateUrl: './division-registries.component.html',
})
export class DivisionRegistriesComponent implements OnInit {
    divisionRegistriesUrl: boolean;
    divisionRegistries: DivisionRegistry[];
    rowSizes: any = RowSizes;
    cols: any[];
    totalRecords: number;
    searchText = '';
    minSearchCharCount: number;

    // preloader message
    preloaderMessage = '...';

    constructor(
        private divisionRegistryService: DivisionRegistryService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
        protected translateService: TranslateService,
    ) {}

    ngOnInit(): void {
        this.divisionRegistriesUrl = this.router.url === '/divisionRegistries';
        this.minSearchCharCount = 3;
    }

    editDivisionRegistry(divisionRegistry: DivisionRegistry): void {
        this.router.navigate(['divisionRegistry', divisionRegistry.id]);
    }

    addDivisionRegistry(): void {
        this.router.navigate(['divisionRegistry']);
    }

    loadDivisionRegistries(event: LazyLoadEvent = {}) {
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

        this.divisionRegistryService.getDivisionRegistries(args).subscribe((result) => {
            // preloading init
            this.ngxLoader.start();

            this.divisionRegistries = result.content;
            this.totalRecords = result.totalElements;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();
        });
    }

    getPreloaderMessage() {
        if (this.divisionRegistries.length === 0) {
            return '...';
        } else if (this.divisionRegistries.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.divisionRegistries.length +
                ' ' +
                this.translateService.instant('PRELOADER.DIVISION_REGISTRY') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.divisionRegistries.length +
                ' ' +
                this.translateService.instant('PRELOADER.DIVISION_REGISTRIES') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }
}
