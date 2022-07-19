import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { DragPanelItem } from '@app/core/layout/elements/drag-panels/drag-panels/dragPanelItem.template';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { Parcel } from '@app/workstation/spatialUnit/parcel/parcel.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { SpatialUnit } from '@app/workstation/spatialUnit/spatialUnit.model';
import { DragElement } from '@app/core/layout/elements/drag-panels/drag-panels/drag-element';
import { forkJoin, Observable, of } from 'rxjs';
import { CodeListService } from '@app/core/services/codeList.service';
import { RegistryService } from '@app/core/services/registry.service';
import { UtilService } from '@app/core/utils/util.service';
import { CodeListTypes } from '@app/core/models/codeListType.model';
import { ParametersService } from '@app/admin/parameters/parameters.service';
import { SelectItem } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Registry } from '@app/core/models/registry.model';

@Component({
    selector: 'sog-spatial-unit-drag-panel-form',
    templateUrl: './spatialUnit-drag-panel.form.component.html',
})
export class SpatialUnitDragPanelFormComponent implements OnInit, OnChanges {
    @Input() source: DragPanelItem;
    @Input() destinations: DragPanelItem[];
    @Input() disabled: boolean;
    @Input() saving: boolean;
    @Input() error: boolean;
    backSource: DragPanelItem;
    backDestinations: DragPanelItem[];
    @Output() save = new EventEmitter<{ source: DragPanelItem; destinations: DragPanelItem[] }>();

    constructor(
        private parametersService: ParametersService,
        private codeListService: CodeListService,
        private registryService: RegistryService,
        private utilService: UtilService,
        private translateService: TranslateService,
    ) {}

    spatialUnit: SpatialUnit;
    baUnit: BAUnit;
    baseBaUnitOptions: any = {};
    baUnitOptions: any = {};
    header = '';
    showPopup = false;
    disabledSelect: SelectItem = {
        label: this.translateService.instant('COMMON.ACTIONS.SELECT'),
        value: undefined,
    };

    ngOnChanges(changes: SimpleChanges) {
        this.backSource = _.clone(this.source);
        this.backDestinations = _.clone(this.destinations);
    }

    onCancel() {
        this.source = _.clone(this.backSource);
        this.destinations = _.clone(this.backDestinations);
    }

    drop(event: CdkDragDrop<DragElement<any>[]>) {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }
    dropSource(event: CdkDragDrop<DragElement<any>[]>) {
        event.previousContainer.data[event.previousIndex].isRemovable = false;
        this.drop(event);
    }
    dropDestination(event: CdkDragDrop<DragElement<any>[]>) {
        if (event.container.data.length > 0) {
            // already at maximum
        } else {
            event.previousContainer.data[event.previousIndex].isRemovable = true;
            this.drop(event);
        }
    }

    expanded(e: any) {
        if (e.base instanceof Parcel) {
            this.showPopup = true;
            this.header = `${e.base.parcelNumber}`;
            this.spatialUnit = e.base;
        } else if (e.item.base instanceof BAUnit) {
            this.showPopup = true;
            this.header = `${e.item.base.titleName}`;
            this.baUnit = e.item.base;
        }
    }

    removed(e: { item: any; collection: any[]; index: number }) {
        const tmpElement = e.collection.splice(e.index, 1)[0];
        tmpElement.isRemovable = false;
        this.source.items.push(tmpElement);
    }

    loadData(): Observable<any> {
        return forkJoin([
            this.baseBaUnitOptions.responsibleOffices && this.baseBaUnitOptions.responsibleOffices.length > 0
                ? of(this.baseBaUnitOptions.responsibleOffices)
                : this.parametersService.getAllResponsibleOffices(false),
            this.baseBaUnitOptions.baUnitCreationModes && this.baseBaUnitOptions.dBaUnitCreationModes.length > 0
                ? of(this.baseBaUnitOptions.dBaUnitCreationModes)
                : this.codeListService.getCodeLists({ type: CodeListTypes.BA_UNIT_CREATION_MODE }),
            this.baseBaUnitOptions.baUnitTypes && this.baseBaUnitOptions.baUnitTypes.length > 0
                ? of(this.baseBaUnitOptions.baUnitTypes)
                : this.codeListService.getCodeLists({ type: CodeListTypes.BA_UNIT_TYPE }),
            this.baseBaUnitOptions.registries && this.baseBaUnitOptions.registries.length > 0
                ? of(this.baseBaUnitOptions.registries)
                : this.registryService.getRegistries(),
        ]);
    }
    setupData(): void {
        this.loadData().subscribe(([responsibleOffices, creationModes, baUnitTypes, registries]) => {
            this.baseBaUnitOptions = { responsibleOffices, creationModes, baUnitTypes, registries };
            const setuptTitleTypes = (filter?: { id?: string; ids?: string[] }) => {
                this.baseBaUnitOptions.baUnitTypes = filter
                    ? _.filter(baUnitTypes, (baUnitType) =>
                          filter.id
                              ? baUnitType.codeListID === filter.id
                              : filter.ids
                              ? filter.ids.includes(baUnitType.codeListID)
                              : true,
                      )
                    : baUnitTypes;
            };
            const setupRegistries = (filter?: { ids?: string[]; titleTypesIds?: string[] }) => {
                this.baseBaUnitOptions.registries =
                    filter && (filter.ids || filter.titleTypesIds)
                        ? _.uniq(
                              _.filter(
                                  registries,
                                  (registry: Registry) =>
                                      (!filter.ids || (filter.ids && filter.ids.includes(registry.id))) &&
                                      (!filter.titleTypesIds ||
                                          (filter.titleTypesIds &&
                                              filter.titleTypesIds.includes(registry.titleType.codeListID))),
                              ),
                          )
                        : registries;
            };
            const getCurrentRegistriesIds = (): string[] =>
                this.baUnit.responsibleOffice.registries.map((registry) => registry.id);
            const getTitleTypeIds = (): string[] =>
                _.uniq(this.baUnit.responsibleOffice.registries.map((registry) => registry.titleType.codeListID));
            const getMapToSelectItems = (
                items: any[],
                autoSet?: string,
                translate?: { prefix: string; valuePath: string },
            ): any[] => {
                const tmp = items
                    ? translate
                        ? this.utilService.getTranslatedToSelectItem(items, translate.valuePath, translate.prefix)
                        : items.map((item) => item.toSelectItem())
                    : [];
                if (!translate) {
                    tmp.unshift(this.disabledSelect);
                } else if (autoSet && tmp.length > 0 && this.baUnit && !this.baUnit[autoSet]) {
                    this.baUnit[autoSet] = tmp[0].value;
                }
                return tmp;
            };

            if (this.baUnit && this.baUnit.responsibleOffice && this.baUnit.responsibleOffice.id) {
                setuptTitleTypes({ ids: getTitleTypeIds() });
                if (this.baUnit.type) {
                    setupRegistries({
                        ids: getCurrentRegistriesIds(),
                        titleTypesIds: this.baseBaUnitOptions.baUnitTypes.map((baUnitType) => baUnitType.codeListID),
                    });
                }
            }

            const translateCodeList = { prefix: 'CODELIST.VALUES', valuePath: 'value.value' };
            this.baUnitOptions.responsibleOffices = getMapToSelectItems(
                this.baseBaUnitOptions.responsibleOffices,
                'responsibleOffice',
            );
            this.baUnitOptions.baUnitTypes = getMapToSelectItems(
                this.baseBaUnitOptions.baUnitTypes,
                'type',
                translateCodeList,
            );
            this.baUnitOptions.registriesItems = getMapToSelectItems(this.baseBaUnitOptions.registries);
            this.baUnitOptions.creationModes = getMapToSelectItems(
                this.baseBaUnitOptions.creationModes,
                null,
                translateCodeList,
            );
        });
    }

    ngOnInit() {
        this.setupData();
    }
}
