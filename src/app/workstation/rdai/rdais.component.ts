import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RowSizes } from '@app/core/models/rowSize.model';
import { TranslateService } from '@ngx-translate/core';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { Rdai } from '@app/core/models/rdai.model';
import { RdaiService } from '@app/core/services/rdai.service';
import { BAUnitService } from '@app/workstation/baUnit/baUnit.service';

@Component({
    selector: 'app-rdais',
    templateUrl: 'rdais.component.html',
})
export class RdaisComponent implements OnInit {
    rdaisUrl: boolean;
    rdais: Rdai[];
    rowSizes: any = RowSizes;
    cols: any[];
    totalRecords: number;
    searchText = '';
    minSearchCharCount: number;

    // preloader message
    preloaderMessage = '...';

    constructor(
        private rdaiService: RdaiService,
        private router: Router,
        private ngxLoader: NgxUiLoaderService,
        protected translateService: TranslateService,
        protected baUnitService: BAUnitService,
    ) {}

    ngOnInit(): void {
        this.rdaisUrl = this.router.url === '/rdais';
        this.minSearchCharCount = 3;
    }

    editRdai(rdai: Rdai): void {
        this.router.navigate(['rdai', rdai.id]);
    }

    addRdai(): void {
        this.router.navigate(['rdai']);
    }

    loadRdais(event: LazyLoadEvent = {}) {
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

        this.rdaiService.getRdais(args).subscribe((result) => {
            // preloading init
            this.ngxLoader.start();

            this.rdais = result.content;

            // TODO :: performance issues. To be remove after rdai entity is extended in back-end
            this.rdais.forEach((_rdai) => {
                this.baUnitService.getBAUnitById(_rdai.baUnitId).subscribe((_baUnit) => {
                    _rdai.baUnitResponsibleOffice = _baUnit.responsibleOffice.name;
                });
            });

            this.totalRecords = result.totalElements;

            // setting the preloader message
            this.preloaderMessage = this.getPreloaderMessage();

            // stopping the preloading
            this.ngxLoader.stop();
        });
    }

    getPreloaderMessage() {
        if (this.rdais.length === 0) {
            return '...';
        } else if (this.rdais.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.rdais.length +
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
                this.rdais.length +
                ' ' +
                this.translateService.instant('PRELOADER.RDAIS') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }
}
