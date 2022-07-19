import { Component, ComponentFactoryResolver, Injector, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { UtilService } from '@app/core/utils/util.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { LazyLoadEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { DataService } from '@app/data/data.service';
import { PreregistrationFormality } from './preregistrationFormality/preregistrationFormality.model';
import { PreregistrationFormalityService } from './preregistrationFormality/preregistrationFormality.service';
import { Table } from 'primeng/table';

@Component({
    selector: 'app-preregistration-formalities',
    templateUrl: 'preregistrationFormalities.component.html',
})
export class PreregistrationFormalitiesComponent implements OnInit {
    preregistrationFormalies: PreregistrationFormality[];
    cols: any[];
    searchFields: SelectItem[];
    searchField: string;
    searchText = '';

    cForm: any;
    totalRecords: number;
    rows: number;

    @ViewChild('rfp') table: Table;

    @ViewChild('lazyWorkstation', { read: ViewContainerRef })
    private lazyWorkstationVcRef: ViewContainerRef;

    expandedRows = {};
    isExpanded: boolean = false;

    // preloader message
    preloaderMessage = '...';

    constructor(
        private preregistrationFormalityService: PreregistrationFormalityService,
        private translateService: TranslateService,
        private alertService: AlertService,
        private utilService: UtilService,
        private dataService: DataService,
        private ngxLoader: NgxUiLoaderService,
        private vcref: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private injector: Injector,
    ) {}

    ngOnInit() {
        this.loadRFP();
        this.dataService.getFormByName('RFP_FORM').subscribe((prfs) => (this.cForm = JSON.parse(prfs.body)));

        this.cols = [
            { field: 'id', header: 'PREREGISTRATION_FORMALITY.ID' },
            { field: 'date', header: 'PREREGISTRATION_FORMALITY.DATE' },
            { field: 'applicant', header: 'PREREGISTRATION_FORMALITY.APPLICANT' },
            { field: 'owner', header: 'PREREGISTRATION_FORMALITY.OWNER' },
        ];

        this.searchFields = [
            this.utilService.getSelectPlaceholder(),
            {
                value: 'id',
                label: this.translateService.instant('PREREGISTRATION_FORMALITY.ID'),
            },
            {
                value: 'applicant',
                label: this.translateService.instant('PREREGISTRATION_FORMALITY.APPLICANT'),
            },
        ];
    }

    searchRFP() {
        if (this.searchField !== undefined) {
            if (this.table) {
                this.table.reset();
            }

            this.loadRFP();
        }
    }

    loadRFP(event: LazyLoadEvent = {}) {
        const args = {
            page: event.first / event.rows,
            perPage: event.rows ? event.rows : null,
            orderBy: event.sortField,
            direction: event.sortOrder,
            searchText: this.searchText.trim(),
            searchField: this.searchField,
        };

        this.preregistrationFormalityService.getAllPreregistrationFormalities(args).subscribe(
            (result) => {
                if (result.content.length) {
                    // preloading init
                    this.ngxLoader.start();

                    this.preregistrationFormalies = result.content;
                    this.totalRecords = result.totalElements;
                    this.rows = result.size;

                    // setting the preloader message
                    this.preloaderMessage = this.getPreloaderMessage();

                    // stopping the preloading
                    this.ngxLoader.stop();
                } else {
                    this.alertService.error('API_MESSAGES.NO_DATA_FOUND');
                }
            },
            (err) => this.alertService.apiError(err),
        );
    }

    getPreloaderMessage() {
        if (this.preregistrationFormalies.length === 0) {
            return '...';
        } else if (this.preregistrationFormalies.length === 1) {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.preregistrationFormalies.length +
                ' ' +
                this.translateService.instant('PRELOADER.REGISTRE_FORMALITY') +
                ' ' +
                this.translateService.instant('PRELOADER.IS_LOADING') +
                '.'
            );
        } else {
            return (
                this.translateService.instant('PRELOADER.ONE_MOMENT') +
                ', ' +
                this.preregistrationFormalies.length +
                ' ' +
                this.translateService.instant('PRELOADER.REGISTRE_FORMALITIES') +
                ' ' +
                this.translateService.instant('PRELOADER.ARE_LOADING') +
                '.'
            );
        }
    }

    async loadWorkstation(rowData){
        if(!this.isExpanded){
            const { PreregistrationFormalityComponent } = await import('./preregistrationFormality/preregistrationFormality.component');
            setTimeout(() => {
                if(this.lazyWorkstationVcRef){
                    this.lazyWorkstationVcRef.clear();
                    let workstation = this.lazyWorkstationVcRef.createComponent(
                    this.cfr.resolveComponentFactory(PreregistrationFormalityComponent), null, this.injector
                    );
                    workstation.instance.preregistrationFormality = rowData;
                    workstation.instance.readOnly = true;
                    workstation.instance.form = this.cForm;
                }
            }, 100);
        }
    }

    reload(){
        this.loadRFP();
    }

    onRowExpand() {
        if(Object.keys(this.expandedRows).length === this.preregistrationFormalies.length){
          this.isExpanded = true;
        }
    }
    onRowCollapse() {
        if(Object.keys(this.expandedRows).length === 0){
            this.isExpanded = false;
        }
    }

    closeAll() {
        this.expandedRows={};
        this.isExpanded = false;
    }
}
