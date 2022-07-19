import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import * as _ from 'lodash';
import { FormTemplateBaseComponent } from '@app/workstation/baseForm/form-template-base.component';
import { FormVariables } from '@app/workstation/baseForm/formVariables.model';
import { BAUnit } from '@app/workstation/baUnit/baUnit.model';
import { SpatialUnitTypes } from '@app/workstation/spatialUnit/spatialUnitType.model';
import { SpatialUnit } from './spatialUnit.model';

@Component({
    selector: 'app-spatial-unit-picker',
    templateUrl: './spatialUnitPicker.component.html',
})
export class SpatialUnitPickerComponent extends FormTemplateBaseComponent implements OnInit {
    @Input() baUnit: BAUnit;
    @Input() formVariables: FormVariables = new FormVariables({});
    @Input() header = 'SPATIAL_UNIT.TITLE_ADD';
    @Input() onlyTerrains = false;
    @Input() onlyBuildings = false;
    @Input() multiSelect = false;
    @Output() saved = new EventEmitter<SpatialUnit | SpatialUnit[]>();
    @Output() canceled = new EventEmitter<SpatialUnit>();
    spatialUnit: SpatialUnit;
    spatialUnits: SpatialUnit[];
    rowSizes: any = RowSizes;
    selectedSpatialUnits: SpatialUnit[];
    cols: any[];

    constructor(protected route: ActivatedRoute, protected translateService: TranslateService) {
        super();
    }

    ngOnInit(): void {
        let spatialUnits = [];
        this.spatialUnits = [];
        if (this.baUnit) {
            spatialUnits = this.baUnit.spatialUnits.filter(
                (item) =>
                    item.suid !== undefined && item.suid !== null && item.spatialUnitType === SpatialUnitTypes.PARCEL,
            );
        } else if (this.onlyTerrains) {
            spatialUnits = this.formVariables.baUnit.spatialUnits.filter(
                (item) =>
                    item.suid !== undefined && item.suid !== null && item.spatialUnitType === SpatialUnitTypes.PARCEL,
            );
        } else if (this.onlyBuildings) {
            spatialUnits = this.formVariables.baUnit.spatialUnits.filter(
                (item) =>
                    item.suid !== undefined && item.suid !== null && item.spatialUnitType === SpatialUnitTypes.BUILDING,
            );
        } else {
            spatialUnits = this.formVariables.baUnit.spatialUnits.filter(
                (item) => item.suid !== undefined && item.suid !== null,
            );
        }

        for (const spatialUnit of spatialUnits) {
            spatialUnit['type'] = this.translateService.instant('SPATIAL_UNIT.TYPES.' + spatialUnit['spatialUnitType']);
            spatialUnit['parcelType'] =
                spatialUnit['spatialUnitType'] === SpatialUnitTypes.BUILDING
                    ? this.translateService.instant('SPATIAL_UNIT.PARCEL.SUB_PARCEL.UNDEFINED')
                    : this.translateService.instant(
                          'SPATIAL_UNIT.PARCEL.SUB_PARCEL.' + String(spatialUnit['mainParcel']).toUpperCase(),
                      );
            spatialUnit['id'] =
                spatialUnit['spatialUnitType'] === SpatialUnitTypes.BUILDING
                    ? spatialUnit['buildingNumber']
                    : spatialUnit['parcelNumber'];
            spatialUnit['parentParcel'] =
                spatialUnit['spatialUnitType'] === SpatialUnitTypes.PARCEL
                    ? spatialUnit.parent
                        ? spatialUnit.parent.parcelNumber
                        : ''
                    : spatialUnit.buildingParcelNumbers;
            this.spatialUnits.push(spatialUnit);
        }

        this.spatialUnits = _.orderBy(this.spatialUnits, ['inscriptionDate', 'id'], ['asc', 'asc']);

        if (!this.onlyBuildings) {
            this.cols = [
                { field: 'id', header: this.translateService.instant('SPATIAL_UNIT.ID'), width: '8%' },
                { field: 'type', header: this.translateService.instant('SPATIAL_UNIT.UNIT_TYPE'), width: '12%' },
                {
                    field: 'parcelType',
                    header: this.translateService.instant('SPATIAL_UNIT.REGISTERED'),
                    width: '12.5%',
                },
                { field: 'parentParcel', header: this.translateService.instant('SPATIAL_UNIT.PARENT'), width: '10%' },
                {
                    field: 'radiationDate',
                    header: this.translateService.instant('SPATIAL_UNIT.RADIATION_DATE'),
                    width: '10%',
                },
                {
                    field: 'destinationTitle',
                    header: this.translateService.instant('SPATIAL_UNIT.DESTINATION_TITLE'),
                    width: '10%',
                },
                {
                    field: 'inscriptionDate',
                    header: this.translateService.instant('SPATIAL_UNIT.INSCRIPTION_DATE'),
                    width: '10%',
                },
                {
                    field: 'sourceTitle',
                    header: this.translateService.instant('SPATIAL_UNIT.SOURCE_TITLE'),
                    width: '10%',
                },
                {
                    field: 'modDate',
                    header: this.translateService.instant('SPATIAL_UNIT.MODIFICATION_DATE'),
                    width: '10%',
                },
            ];
        } else {
            this.cols = [
                { field: 'suid', header: this.translateService.instant('SPATIAL_UNIT.ID') },
                { field: 'type', header: this.translateService.instant('SPATIAL_UNIT.UNIT_TYPE') },
                { field: 'modDate', header: this.translateService.instant('SPATIAL_UNIT.MODIFICATION_DATE') },
            ];
        }
    }

    save(spatialUnit: SpatialUnit | SpatialUnit[]) {
        this.saved.emit(spatialUnit);
    }

    cancel(): void {
        this.canceled.emit(this.spatialUnit);
    }
}
