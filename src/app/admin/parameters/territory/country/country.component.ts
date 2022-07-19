import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Country } from '@app/core/models/territory/country.model';
import { Region } from '@app/core/models/territory/region.model';
import { TerritorySection } from '@app/core/models/territory/territorySection.model';
import { DataService } from '@app/data/data.service';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-params-territory-country',
    templateUrl: './country.component.html',
})
export class CountryComponent implements OnInit {
    rowSizes: any = RowSizes;
    cols: TableCols[];
    currentCountry: Country;
    currentCountrySelected: Country;
    countries: Country[];
    modalTitle: string;
    modalErrors: any;
    add:string=this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.ADD');
    view:string=this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.VIEW');
    edit:string=this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.EDIT');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'countries',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        addBtn: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['code', 'name', 'description'],
        actions: [
            {
                type: 'view',
                callback: 'viewFn',
            },
            {
                type: 'edit',
                callback: 'editFn',
            }, {
                type: 'delete',
                callback: 'deleteFn',
            }]
    }

    @ViewChild('lazyCurrentCountry', { read: ViewContainerRef })
    private lazyCurrentCountryVcRef: ViewContainerRef;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private parametersService: ParametersService,
        private dataService: DataService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) { }

    ngOnInit() {
        this.loadCountries();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.TERRITORY.COMMON.DESCRIPTION',
            ])
            .subscribe((translate) => {
                this.cols = [
                    {
                        field: 'code',
                        header: translate['PARAMETERS.TERRITORY.COMMON.CODE'],
                        width: '20%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'name',
                        header: translate['PARAMETERS.TERRITORY.COMMON.NAME'],
                        width: '20%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                    {
                        field: 'description',
                        header: translate['PARAMETERS.TERRITORY.COMMON.DESCRIPTION'],
                        width: '60%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                ];
            });
    }

    showCountryElementDialogue(country?: Country) {
        this.currentCountrySelected = country;
        if (country) {
           // this.modalTitle = this.translateService.instant('PARAMETERS.TERRITORY.COUNTRY.EDIT');
            this.currentCountry = _.clone(country);
        } else {
            this.modalTitle = this.add;
            this.currentCountry = new Region({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentCountry) {
            const { ElementDialogComponent } = await import('../elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentCountryVcRef.clear();

                const elementDialog = this.lazyCurrentCountryVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentCountry;
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.errors = this.modalErrors;
                if(elementDialog.instance.title===this.view){
                    elementDialog.instance.disable=true;
                }
                else{
                    elementDialog.instance.disable=false;
                }


                elementDialog.instance.saved.subscribe(($event: any) => {
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    removeCountry(country: Country) {
        //TODO put an endDate on the region
    }

    saved(country: Country) {
        if (!country.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!country.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else if (!country.sigtasId) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_SIGTAS_ID' };
        } else {
            this.parametersService.saveCountry(country).subscribe((nCountry) => {
                if (country.id) {
                    this.countries.splice(this.countries.indexOf(this.currentCountrySelected), 1, nCountry);
                    this.currentCountrySelected = null;
                } else {
                    this.countries.push(nCountry);
                }
                this.currentCountry = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentCountry = null;
    }

    loadCountries() {
        this.parametersService.getAllTerritoryBySection(TerritorySection.COUNTRY, true).subscribe((countries) => {
            this.countries = <Country[]>countries;
            // data to preload
            this.preloaderService.setCountriesToPreload(this.countries);
        });
    }

    reload() {
        this.loadCountries();

    }
    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }

    editFn(item) {
        this.modalTitle=this.edit;
        this.showCountryElementDialogue(item);
    }
    viewFn(item) {
        this.modalTitle = this.view;
        this.showCountryElementDialogue(item);
    }
    deleteFn(item) {
        this.removeCountry(item);
    }
}
