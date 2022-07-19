import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Registry } from '@app/core/models/registry.model';
import { PreloaderService } from '@app/core/services/preloader.service';
import { CodeListService } from '@app/core/services/codeList.service';
import { UtilService } from '@app/core/utils/util.service';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { RowSizes } from '@app/core/models/rowSize.model';
import { DataService } from '@app/data/data.service';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-params-registry',
    templateUrl: './registry.component.html',
})
export class RegistryComponent implements OnInit {
    rowSizes: any = RowSizes;
    currentRegistry: Registry;
    currentRegistrySelected: Registry;
    registries: Registry[];
    modalTitle: string;
    modalErrors: any;
    titleTypes: SelectItem[];
    add: string = this.translateService.instant('PARAMETERS.REGISTRY.ADD');
    view: string = this.translateService.instant('PARAMETERS.REGISTRY.VIEW');
    edit: string = this.translateService.instant('PARAMETERS.REGISTRY.EDIT');
    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.REGISTRY.TITLE'),
        titleTooltip: this.translateService.instant('PARAMETERS.REGISTRY.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'registry',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        addBtn: true,
        searchBarField: ['code', 'name', 'title_type'],
        actions: [
            {
                type: 'view',
                callback: 'viewFn',
            },
            {
                type: 'edit',
                callback: 'editFn',
            }
        ]
    }

    cols: TableCols[] = [];

    @ViewChild('lazyParamsTerritoryElement', { read: ViewContainerRef })
    private lazyParamsTerritoryElementVcRef: ViewContainerRef;

    constructor(
        private translateService: TranslateService,
        private alertService: AlertService,
        private parametersService: ParametersService,
        private dataService: DataService,
        private codeListService: CodeListService,
        private utilService: UtilService,
        private preloaderService: PreloaderService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) { }

    ngOnInit() {
        this.loadRegistries();
        this.translateService
            .get([
                'PARAMETERS.TERRITORY.COMMON.CODE',
                'PARAMETERS.TERRITORY.COMMON.NAME',
                'PARAMETERS.REGISTRY.TITLE_TYPE',
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
                        field: 'title_type',
                        header: translate['PARAMETERS.REGISTRY.TITLE_TYPE'],
                        width: '60%',
                        sortable: true,
                        filterable: true,
                        type: 'text'
                    },

                ];
            });
    }

    showRegisreyBookElementDialogue(registry?: Registry) {
        this.currentRegistrySelected = registry;
        if (registry) {
            //   this.modalTitle = this.translateService.instant('PARAMETERS.REGISTRY.EDIT');
            this.currentRegistry = _.clone(registry);
        } else {
            this.modalTitle = this.translateService.instant('PARAMETERS.REGISTRY.ADD');
            this.currentRegistry = new Registry({});
        }
        this.lazyLoadParamsTerritoryElement();
    }

    async lazyLoadParamsTerritoryElement() {
        if (this.currentRegistry) {
            const { ElementDialogComponent } = await import('../territory/elementDialog.component');
            setTimeout(() => {
                this.lazyParamsTerritoryElementVcRef.clear();

                const paramsTerritoryElement = this.lazyParamsTerritoryElementVcRef.createComponent(
                    this.cfr.resolveComponentFactory(ElementDialogComponent),
                );
                paramsTerritoryElement.instance.title = this.modalTitle;
                paramsTerritoryElement.instance.item = this.currentRegistry;
                paramsTerritoryElement.instance.col = this.titleTypes;
                paramsTerritoryElement.instance.errors = this.modalErrors;
                if (paramsTerritoryElement.instance.title === this.view) {
                    paramsTerritoryElement.instance.disable = true;
                }
                else {
                    paramsTerritoryElement.instance.disable = false;
                }
                paramsTerritoryElement.instance.convertToSelectItem = false;
                paramsTerritoryElement.instance.selectTxt = this.translateService.instant(
                    'PARAMETERS.REGISTRY.SELECT_TITLE_TYPE',
                );
                paramsTerritoryElement.instance.subItemModel = 'titleType';
                paramsTerritoryElement.instance.subItemLabel = this.translateService.instant(
                    'PARAMETERS.REGISTRY.TITLE_TYPE',
                );
                paramsTerritoryElement.instance.saved.subscribe(($event: any) => {
                    this.saved($event);
                });
                paramsTerritoryElement.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    saved(registry: Registry) {
        if (!registry.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!registry.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else {
            this.parametersService.saveRegistry(registry).subscribe((nRegistry) => {
                if (registry.id) {
                    this.registries.splice(this.registries.indexOf(this.currentRegistrySelected), 1, nRegistry);
                    this.currentRegistrySelected = null;
                } else {
                    this.registries.push(nRegistry);
                }
                this.currentRegistry = null;
                this.alertService.success('MESSAGES.FORMS.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentRegistry = null;
    }

    loadRegistries() {
        forkJoin([
            this.utilService.mapToSelectItems(this.codeListService.getCodeLists({ type: CodeListTypes.BA_UNIT_TYPE })),
            this.parametersService.getAllRegistries(false),
        ]).subscribe(([titleTypes, registries]) => {
            this.registries = registries;
            this.titleTypes = titleTypes.map((titleType) => {
                titleType.label = titleType.value
                    ? this.translateService.instant('CODELIST.VALUES.' + titleType.label)
                    : titleType.label;
                return titleType;
            });
            // data to preload
            this.preloaderService.setRegistriesToPreload(this.registries);
        });
    }

    reload() {
        this.loadRegistries();
    }

    call($event) {
        var fn = $event[0];
        this[fn]($event[1]);
    }
    editFn(item) {
        this.modalTitle = this.edit;
        this.showRegisreyBookElementDialogue(item)
    }
    viewFn(item) {
        this.modalTitle = this.view;

        this.showRegisreyBookElementDialogue(item)
    }
}
