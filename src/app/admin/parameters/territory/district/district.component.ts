import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { District } from '@app/core/models/territory/district.model';
import { Division } from '@app/core/models/territory/division.model';
import { Region } from '@app/core/models/territory/region.model';
import { TerritorySection } from '@app/core/models/territory/territorySection.model';
import { DataService } from '@app/data/data.service';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-params-territory-district',
    templateUrl: './district.component.html',
})
export class DistrictComponent implements OnInit {
    rowSizes: any = RowSizes;
    cols: TableCols[];
    currentDistrict: District;
    currentDistrictSelected: District;
    districts: District[];
    mapDivisons = {};
    divisions: Division[];
    modalTitle: string;
    modalErrors: any;
    add:string=this.translateService.instant('PARAMETERS.TERRITORY.DISTRICT.ADD');
    view:string=this.translateService.instant('PARAMETERS.TERRITORY.DISTRICT.VIEW');
    edit:string=this.translateService.instant('PARAMETERS.TERRITORY.DISTRICT.EDIT');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.TERRITORY.DISTRICT.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'districts',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        addBtn: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['code', 'name', 'divisionName'],
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

    @ViewChild('lazyCurrentDistrict', { read: ViewContainerRef })
    private lazyCurrentDistrictVcRef: ViewContainerRef;

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
        this.loadDistricts();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.TERRITORY.DISTRICT.DIVISION_NAME',
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
                        width: '25%',
                        sortable: true,
                        filterable: true,
                        type: 'text'

                    },
                    {
                        field: 'divisionName',
                        header: translate['PARAMETERS.TERRITORY.DISTRICT.DIVISION_NAME'],
                        width: '20%',
                        sortable: true,
                        filterable: true,
                        type: 'text'

                    }
                ];
            });
    }

    showDistrictElementDialogue(district?: District) {
        this.currentDistrictSelected = district;
        if (district) {
            this.currentDistrict = _.clone(district);
        } else {
            this.modalTitle = this.add;
            this.currentDistrict = new District({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentDistrict) {
            const { ElementDialogComponent } = await import('../elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentDistrictVcRef.clear();

                const elementDialog = this.lazyCurrentDistrictVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentDistrict;
                elementDialog.instance.col = this.divisions;
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.errors = this.modalErrors;
                if(elementDialog.instance.title===this.view){
                    elementDialog.instance.disable=true;
                }
                else{
                    elementDialog.instance.disable=false;
                }
                elementDialog.instance.selectTxt = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DISTRICT.SELECT_DIVISION',
                );
                elementDialog.instance.subItemModel = 'division';
                elementDialog.instance.subItemLabel = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DISTRICT.DIVISION_NAME',
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

    removeDistrict(region: Region) {
        //TODO put an endDate on the region
    }

    saved(district: District) {
        if (!district.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!district.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else if (!district.division) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_DIVISION' };
        } else if (!district.sigtasId) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_SIGTAS_ID' };
        } else {
            district.divisionId = district.division.id;
            this.parametersService.saveDistrict(district, true).subscribe((nDistrict) => {
                nDistrict.division = this.mapDivisons[nDistrict.divisionId];
                if (district.id) {
                    this.districts.splice(this.districts.indexOf(this.currentDistrictSelected), 1, nDistrict);
                    this.currentDistrictSelected = null;
                } else {
                    this.districts.push(nDistrict);
                }
                this.currentDistrict = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentDistrict = null;
    }

    loadDistricts() {
        forkJoin([
            this.parametersService.getAllTerritoryBySection(TerritorySection.DISTRICT, true),
            this.parametersService.getAllTerritoryBySection(TerritorySection.DIVISION, true),
        ]).subscribe(([districts, divisions]) => {
            this.mapDivisons = {};
            this.divisions = <Division[]>divisions;
            for (const division of <Division[]>divisions) {
                this.mapDivisons[division.id] = division;
                
            }
            for (const district of <District[]>districts) {
                district.division = this.mapDivisons[district.divisionId];
                district.divisionName=district.division.name;
            }
            this.districts = <District[]>districts;
            // data to preload
            this.preloaderService.setDistrictsToPreload(this.districts);
        });
    }

    reload() {
        this.loadDistricts();

    }
    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }

    editFn(item) {
        this.modalTitle=this.edit;
        this.showDistrictElementDialogue(item)
    }
    viewFn(item) {
        this.modalTitle = this.view;
        this.showDistrictElementDialogue(item)
    }

    deleteFn(item) {
        this.removeDistrict(item)
    }
}
