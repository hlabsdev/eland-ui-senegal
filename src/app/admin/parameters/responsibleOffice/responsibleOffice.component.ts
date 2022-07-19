import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Registry } from '@app/core/models/registry.model';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import { PreloaderService } from '@app/core/services/preloader.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { UtilService } from '@app/core/utils/util.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { RowSizes } from '@app/core/models/rowSize.model';
import { DataService } from '@app/data/data.service';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';
import { NgxUiLoaderService } from 'ngx-ui-loader';

@Component({
    selector: 'app-params-responsible-office',
    templateUrl: './responsibleOffice.component.html',
})
export class ResponsibleOfficeComponent implements OnInit {
    rowSizes: any = RowSizes;
    currentResponsibleOffice: ResponsibleOffice;
    currentResponsibleOfficeSelected: ResponsibleOffice;
    responsibleOffices: ResponsibleOffice[];
    registries: Registry[];
    roles: SelectItem[];
    taxCenters: SelectItem[];
    modalTitle: string;
    modalErrors: any;
    titleTypes: SelectItem[];

    preloaderMessage = '...';

    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.TITLE'),
        titleTooltip: this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'responsibleOffice',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['code', 'name', 'taxCenterId', 'registryCodes'],
        actions: [{
            type: 'view',
            callback: 'viewItem',
        },{
            type: 'edit',
            callback: 'showElementDialogue',
        }],
    }

    cols: TableCols[] = [];

    @ViewChild('lazyCurrentResponsibleOffice', { read: ViewContainerRef })
    private lazyCurrentResponsibleOfficeVcRef: ViewContainerRef;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private parametersService: ParametersService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
        private ngxLoader: NgxUiLoaderService
    ) {}

    ngOnInit() {
        this.loadData();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.RESPONSIBLE_OFFICE.TAX_CENTER_ID',
                'PARAMETERS.RESPONSIBLE_OFFICE.REGISTRY_CODES',
            ])
            .subscribe((translate) => {
                this.cols = [
                    { field: 'code', header: translate['PARAMETERS.TERRITORY.COMMON.CODE'], sortable: true, filterable: true, type: 'text' },
                    { field: 'name', header: translate['PARAMETERS.TERRITORY.COMMON.NAME'], sortable: true, filterable: true, type: 'text' },
                    { field: 'taxCenterId', header: translate['PARAMETERS.RESPONSIBLE_OFFICE.TAX_CENTER_ID'], sortable: true, filterable: true, type: 'text' },
                    { field: 'registryCodes', header: translate['PARAMETERS.RESPONSIBLE_OFFICE.REGISTRY_CODES'], sortable: true, filterable: true, type: 'text' },
                ];
            });
    }

    showElementDialogue(responsibleOffice?: ResponsibleOffice, disabled: boolean = false) {
        this.currentResponsibleOfficeSelected = responsibleOffice;
        if (responsibleOffice) {
            this.modalTitle = this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.EDIT');
            this.currentResponsibleOffice = _.clone(responsibleOffice);
        } else {
            this.modalTitle = this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.ADD');
            this.currentResponsibleOffice = new ResponsibleOffice({});
        }
        this.lazyLoadElementDialog(disabled);
    }

    viewItem(responsibleOffice?: ResponsibleOffice){
        this.showElementDialogue(responsibleOffice, true);
    }

    async lazyLoadElementDialog(disabled: boolean = false) {
        if (this.currentResponsibleOffice) {
            const { ElementDialogResponsibleOfficeComponent } = await import('./elementDialog.component');
            setTimeout(() => {
                this.lazyCurrentResponsibleOfficeVcRef.clear();

                const elementDialog = this.lazyCurrentResponsibleOfficeVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogResponsibleOfficeComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentResponsibleOffice;
                elementDialog.instance.col = this.registries;
                elementDialog.instance.errors = this.modalErrors;
                elementDialog.instance.itemMultiple = true;
                elementDialog.instance.roles = this.roles;
                elementDialog.instance.taxCenters = this.taxCenters;
                elementDialog.instance.disabled = disabled;
                elementDialog.instance.selectTxt = 'PARAMETERS.RESPONSIBLE_OFFICE.SELECT_REGISTRIES';
                elementDialog.instance.subItemLabel = 'PARAMETERS.RESPONSIBLE_OFFICE.REGISTRIES_NAME'
                elementDialog.instance.subItemModel = 'registries';
                elementDialog.instance.saved.subscribe(($event: any) => {
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    saved(responsibleOffice: ResponsibleOffice) {
        responsibleOffice.correspondingRole = responsibleOffice.code;
        if (!responsibleOffice.taxCenterId) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!responsibleOffice.correspondingRole) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else {
            this.parametersService.saveResponsibleOffice(responsibleOffice).subscribe((nResponsibleOffice) => {
                if (responsibleOffice.id) {
                    this.responsibleOffices.splice(
                        this.responsibleOffices.indexOf(this.currentResponsibleOfficeSelected),
                        1,
                        nResponsibleOffice,
                    );
                    this.currentResponsibleOfficeSelected = null;
                } else {
                    this.responsibleOffices.push(nResponsibleOffice);
                }
                this.currentResponsibleOffice = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
            this.loadData();
        }
    }

    canceled() {
        this.currentResponsibleOffice = null;
    }

    loadData() {
        this.ngxLoader.start();

        forkJoin([
            this.parametersService.getAllResponsibleOffices(),
            this.parametersService.getAllRegistries(false),
            // this.parametersService.getAllKeycloakRoles(),
            this.parametersService.getAllTaxCentersFromSigtas(),
        ]).subscribe(([responsibleOffices, registries /*, roles*/, taxCenters]) => {
            this.registries = registries;
            this.taxCenters = taxCenters.map((taxCenter) => taxCenter.toSelectItem());
            this.taxCenters.unshift({ label: this.translateService.instant('COMMON.ACTIONS.SELECT'), value: null });
            // this.roles = roles.map(role => role.toSelectItem());
            // this.roles.unshift({ label: this.translateService.instant('PARAMETERS.RESPONSIBLE_OFFICE.SELECT_ROLE'), value: null});
            this.responsibleOffices = responsibleOffices;
            this.responsibleOffices.forEach((responsibleOffice) => {
                responsibleOffice.registryNames = responsibleOffice.registries
                    .map((registry) => registry.code)
                    .join(', ');
            });

            this.ngxLoader.stop();

            // data to preload
            this.preloaderService.setResponsibleOfficesToPreload(this.responsibleOffices);
        });
    }

    reload(){
        this.loadData();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
