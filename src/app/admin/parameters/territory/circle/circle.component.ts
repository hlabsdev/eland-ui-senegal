import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { PreloaderService } from '@app/core/services/preloader.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Circle } from '@app/core/models/territory/circle.model';
import { Country } from '@app/core/models/territory/country.model';
import { Region } from '@app/core/models/territory/region.model';
import { TerritorySection } from '@app/core/models/territory/territorySection.model';
import { DataService } from '@app/data/data.service';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-params-territory-circle',
    templateUrl: './circle.component.html',
})
export class CircleComponent implements OnInit {
    rowSizes: any = RowSizes;
    cols: TableCols[];
    currentCircle: Circle;
    currentCircleSelected: Circle;
    circles: Circle[];
    mapRegions = {};
    regions: Country[];
    modalTitle: string;
    modalErrors: any;
    add:string=this.translateService.instant('PARAMETERS.TERRITORY.CIRCLE.ADD');
    view:string=this.translateService.instant('PARAMETERS.TERRITORY.CIRCLE.VIEW');
    edit:string=this.translateService.instant('PARAMETERS.TERRITORY.CIRCLE.EDIT');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.TERRITORY.CIRCLE.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'circle',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        addBtn: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['code', 'name', 'regionName'],
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
    }

    @ViewChild('lazyCurrentCircle', { read: ViewContainerRef })
    private lazyCurrentCircleVcRef: ViewContainerRef;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private parametersService: ParametersService,
        private dataService: DataService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {
        this.loadCircles();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.TERRITORY.CIRCLE.REGION_NAME',
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
                         type: 'text'
                         },
                    {
                        field: 'regionName',
                        header: translate['PARAMETERS.TERRITORY.CIRCLE.REGION_NAME'],
                        width: '20%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    }
                ];
            });
    }

    showCircleElementDialogue(circle?: Circle) {
        this.currentCircleSelected = circle;
        if (circle) {
            this.currentCircle = _.clone(circle);
        } else {
            this.modalTitle = this.add;
            this.currentCircle = new Circle({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentCircle) {
            const { ElementDialogComponent } = await import('../elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentCircleVcRef.clear();

                const elementDialog = this.lazyCurrentCircleVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentCircle;
                elementDialog.instance.col = this.regions;
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.errors = this.modalErrors;
                if(elementDialog.instance.title===this.view){
                    elementDialog.instance.disable=true;
                }
                else{
                    elementDialog.instance.disable=false;
                }
                elementDialog.instance.selectTxt = this.translateService.instant(
                    'PARAMETERS.TERRITORY.CIRCLE.SELECT_REGION',
                );
                elementDialog.instance.subItemModel = 'region';
                elementDialog.instance.subItemLabel = this.translateService.instant(
                    'PARAMETERS.TERRITORY.CIRCLE.REGION_NAME',
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

    removeRegion(circle: Region) {
        // put an endDate on the circle
    }

    saved(circle: Circle) {
        if (!circle.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!circle.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else if (!circle.region) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_REGION' };
        } else {
            circle.regionId = circle.region.id;
            this.parametersService.saveCircle(circle, true).subscribe((nCircle) => {
                nCircle.region = this.mapRegions[nCircle.regionId];
                if (circle.id) {
                    this.circles.splice(this.circles.indexOf(this.currentCircleSelected), 1, nCircle);
                    this.currentCircleSelected = null;
                } else {
                    this.circles.push(nCircle);
                }
                this.currentCircle = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentCircle = null;
    }

    loadCircles() {
        forkJoin([
            this.parametersService.getAllTerritoryBySection(TerritorySection.CIRCLE, true),
            this.parametersService.getAllTerritoryBySection(TerritorySection.REGION, true),
        ]).subscribe(([circles, regions]) => {
            this.mapRegions = {};
            this.regions = <Region[]>regions;
            for (const region of <Region[]>regions) {
                this.mapRegions[region.id] = region;
            }
            for (const circle of <Circle[]>circles) {
                circle.region = this.mapRegions[circle.regionId];
                circle.regionName=circle.region.name;
            }
            this.circles = <Circle[]>circles;
            // data to preload
            this.preloaderService.setCirclesToPreload(this.circles);
        });
    }

    
    reload() {
        this.loadCircles();

    }
    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }

    editFn(item) {
        this.modalTitle = this.edit;
        this.showCircleElementDialogue(item)
    }
    viewFn(item) {
        this.modalTitle = this.view;
        this.showCircleElementDialogue(item)
    }
    deleteFn(item) {
        //TODO this.removeDivision(item)
    }
}
