import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Registry } from '@app/core/models/registry.model';
import { Circle } from '@app/core/models/territory/circle.model';
import { Division } from '@app/core/models/territory/division.model';
import { PreloaderService } from '@app/core/services/preloader.service';
import { DataService } from '@app/data/data.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { forkJoin } from 'rxjs';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-params-territory-division',
    templateUrl: './division.component.html',
})
export class DivisionComponent implements OnInit {
    rowSizes: any = RowSizes;
    cols: TableCols[];
    currentDivision: Division;
    currentDivisionSelected: Division;
    divisions: Division[];
    circles: Circle[];
    registries: Registry[];
    modalTitle: string;
    modalErrors: any;
    add:string= this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.EDIT');
    edit:string= this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.EDIT');
    view: string=this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.VIEW');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'division',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        addBtn: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['code', 'name', 'circleName'],
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

    @ViewChild('lazyCurrentDivision', { read: ViewContainerRef })
    private lazyCurrentDivisionVcRef: ViewContainerRef;

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
        this.loadDivision();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.TERRITORY.DIVISION.REGISTRY_CODE_NAME',
                'PARAMETERS.TERRITORY.DIVISION.CIRCLE_NAME',
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
                        field: 'circleName',
                        header: translate['PARAMETERS.TERRITORY.DIVISION.CIRCLE_NAME'],
                        width: '15%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },
                ];
            });
    }

    showDivisionElementDialogue(division?: Division) {
        this.currentDivisionSelected = division;
        if (division) {
            this.currentDivision = _.clone(division);
        } else {
            this.modalTitle = this.translateService.instant('PARAMETERS.TERRITORY.DIVISION.ADD');
            this.currentDivision = new Division({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentDivision) {
            const { ElementDialogComponent } = await import('../elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentDivisionVcRef.clear();

                const elementDialog = this.lazyCurrentDivisionVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentDivision;
                elementDialog.instance.col = this.circles;
                elementDialog.instance.col2 = this.registries;
                elementDialog.instance.showSigtasField = true;
                elementDialog.instance.errors = this.modalErrors;
                if(elementDialog.instance.title===this.view){
                    elementDialog.instance.disable=true;
                }
                else{
                    elementDialog.instance.disable=false;
                }
                elementDialog.instance.selectTxt = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DIVISION.SELECT_CIRCLE',
                );
                elementDialog.instance.subItemModel = 'circle';
                elementDialog.instance.subItemLabel = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DIVISION.CIRCLE_NAME',
                );
                elementDialog.instance.selectTxt2 = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DIVISION.SELECT_REGISTRY_BOOK_CODE',
                );
                elementDialog.instance.subItemLabel2 = this.translateService.instant(
                    'PARAMETERS.TERRITORY.DIVISION.REGISTRY_CODE_NAME',
                );
                elementDialog.instance.subItemModel2 = 'registry';                elementDialog.instance.saved.subscribe(($event: any) => {
                    $event.registries= Array.of($event.registry);
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    removeDivision(division: Division) {
        //TODO put an endDate on the region
    }

    saved(division: Division) {
        if (!division.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!division.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else if (!division.circle) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CIRCLE' };
        } else if (!division.sigtasId) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_SIGTAS_ID' };
        } else {
            this.parametersService.saveDivision(division).subscribe((nDivision) => {
                if (division.id) {
                    this.divisions.splice(this.divisions.indexOf(this.currentDivisionSelected), 1, nDivision);
                    this.currentDivisionSelected = null;
                } else {
                    this.divisions.push(nDivision);
                }

                this.currentDivision = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentDivision = null;
    }

    loadDivision() {
        forkJoin([
            this.parametersService.getAllDivision(),
            this.parametersService.getAllCircle(),
            this.parametersService.getAllRegistries(false),
        ]).subscribe(([divisions, circles, registries]) => {
            this.registries = registries;
            this.circles = <Circle[]>circles;
            this.divisions = <Division[]>divisions.map((division) => {
                division.registryCode = division.registries.map((registry) => registry.code).join(',');
                division.registryId = division.registries.map((registry) => registry.id).join(',');
                division.circleName=division.circle.name;
                division.registry= Object.assign({}, ...division.registries); 
                return division;
                
            });
            // data to preload
            this.preloaderService.setCommunesToPreload(this.divisions);
        });
    }
    reload() {
        this.loadDivision();

    }
    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }

    editFn(item) {
        this.modalTitle = this.edit;
        this.showDivisionElementDialogue(item)
    }
    viewFn(item) {
        this.modalTitle = this.view;
        this.showDivisionElementDialogue(item)
    }
    deleteFn(item) {
        this.removeDivision(item)
    }
}
