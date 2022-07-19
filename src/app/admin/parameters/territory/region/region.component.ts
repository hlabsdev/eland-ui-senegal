import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
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
    selector: 'app-params-territory-region',
    templateUrl: './region.component.html',
})
export class RegionComponent implements OnInit {
    rowSizes: any = RowSizes;
    cols: TableCols[];
    currentRegion: Region;
    currentRegionSelected: Region;
    regions: Region[];
    mapCountries = {};
    countries: Country[];
    modalTitle: string;
    modalErrors: any;
    add:string=this.translateService.instant('PARAMETERS.TERRITORY.REGION.ADD');
    view:string=this.translateService.instant('PARAMETERS.TERRITORY.REGION.VIEW');
    edit:string=this.translateService.instant('PARAMETERS.TERRITORY.REGION.EDIT');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.TERRITORY.REGION.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'regions',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        addBtn: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['code', 'name', 'countryName'],
        actions: [{
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
    };


    
    @ViewChild('lazyCurrentRegion', { read: ViewContainerRef })
    private lazyCurrentRegionVcRef: ViewContainerRef;

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
        this.loadRegions();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.TERRITORY.REGION.COUNTRY-NAME',
                'PARAMETERS.TERRITORY.COMMON.DESCRIPTION',
            ])
            .subscribe((translate) => {
                this.cols = [
                    {
                        field: 'code',
                        header: translate['PARAMETERS.TERRITORY.COMMON.CODE'],
                        width: '15%',
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
                     type: 'text'},
                    {
                        field: 'countryName',
                        header: translate['PARAMETERS.TERRITORY.REGION.COUNTRY-NAME'],
                        width: '60%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    }
                ];
            });
    }

    showRegionElementDialogue(region?: Region) {
        this.currentRegionSelected = region;
        if (region) {
            this.currentRegion = _.clone(region);
        } else {
            this.modalTitle = this.add;
            this.currentRegion = new Region({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentRegion) {
            const { ElementDialogComponent } = await import('../elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentRegionVcRef.clear();

                const elementDialog = this.lazyCurrentRegionVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentRegion;
                elementDialog.instance.col = this.countries;
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.convertToSelectItem=true;
                elementDialog.instance.errors = this.modalErrors;
                if(elementDialog.instance.title===this.view){
                    elementDialog.instance.disable=true;
                }
                else{
                    elementDialog.instance.disable=false;
                }
                elementDialog.instance.selectTxt = this.translateService.instant(
                    'PARAMETERS.TERRITORY.REGION.SELECT-COUNTRY',
                );
                elementDialog.instance.subItemModel = 'country';
                elementDialog.instance.subItemLabel = this.translateService.instant(
                    'PARAMETERS.TERRITORY.REGION.COUNTRY-NAME',
                );
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.saved.subscribe(($event: any) => {
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    removeRegion(region: Region) {
        // put an endDate on the region
    }

    saved(region: Region) {
        if (!region.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!region.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else if (!region.country) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_COUNTRY' };
        } else if (!region.sigtasId) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_SIGTAS_ID' };
        } else {
            region.countryId = region.country.id;
            this.parametersService.saveRegion(region, true).subscribe((nRegion) => {
                nRegion.country = this.mapCountries[nRegion.countryId];
                if (region.id) {
                    this.regions.splice(this.regions.indexOf(this.currentRegionSelected), 1, nRegion);
                    this.currentRegionSelected = null;
                } else {
                    this.regions.push(nRegion);
                }
                this.currentRegion = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentRegion = null;
    }

    loadRegions() {
        forkJoin([
            this.parametersService.getAllTerritoryBySection(TerritorySection.REGION, true),
            this.parametersService.getAllTerritoryBySection(TerritorySection.COUNTRY, true),
        ]).subscribe(([regions, countries]) => {
            this.mapCountries = {};
            this.countries = <Country[]>countries;
            for (const country of <Country[]>countries) {
                this.mapCountries[country.id] = country;
            }
            for (const region of <Region[]>regions) {
                region.country = this.mapCountries[region.countryId];
                region.countryName=region.country.name;
            }
            this.regions = <Region[]>regions;

            // data to preload
            this.preloaderService.setRegionsToPreload(this.regions);
        });
    }
    reload() {
        this.loadRegions();

    }
    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }

    editFn(item) {
        this.modalTitle = this.edit;
        this.showRegionElementDialogue(item)
    }
    viewFn(item) {
        this.modalTitle = this.view;

        this.showRegionElementDialogue(item)
    }

    deleteFn(item) {
        this.removeRegion(item)
    }
}
