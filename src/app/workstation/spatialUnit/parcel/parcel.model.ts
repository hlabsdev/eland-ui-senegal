import { SpatialUnit } from '../spatialUnit.model';
import Utils from '@app/core/utils/utils';
import { ParcelSmall } from '@app/workstation/spatialUnit/parcel/parcelSmall.model';
import { CodeList } from '@app/core/models/codeList.model';
import { AreaMeasurementUnitEnum } from '@app/workstation/spatialUnit/areaMeasurementUnit.model';
import { Registry } from '@app/core/models/registry.model';
import { District } from '@app/core/models/territory/district.model';
import { clone, isBoolean } from 'lodash';

const DEFAULT_AREA_UNIT: AreaMeasurementUnitEnum = 'MEASURE_UNIT_CENTIARE';

export class Parcel extends SpatialUnit {
    buildingOnParcel: boolean;
    buildingAsPartOfParcel: boolean;
    parcelNumber: string;
    registry: Registry;
    lotName: string;
    blockNumber: string;
    parcelDescription: string;
    nature: CodeList;
    zone: CodeList;
    district: District;
    planStatus: CodeList;
    parcelIsRegistered = false;
    mainParcel: boolean;
    way: string;
    door: string;

    constructor(obj: any = {}) {
        super(obj);
        this.buildingOnParcel = isBoolean(obj.buildingOnParcel) ? obj.buildingOnParcel : false;
        this.buildingAsPartOfParcel = isBoolean(obj.buildingAsPartOfParcel) ? obj.buildingAsPartOfParcel : false;
        this.parcelNumber = obj.parcelNumber;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.lotName = obj.lotName;
        this.blockNumber = obj.blockNumber;
        this.parcelDescription = obj.parcelDescription;
        this.nature = obj.nature ? new CodeList(obj.nature) : null;
        this.zone = obj.zone ? new CodeList(obj.zone) : null;
        this.district = obj.district ? new District(obj.district) : null;
        this.planStatus = obj.planStatus ? new CodeList(obj.planStatus) : null;
        this.parcelIsRegistered = isBoolean(obj.parcelIsRegistered) ? obj.parcelIsRegistered : false;
        this.mainParcel = isBoolean(obj.mainParcel) ? obj.mainParcel : false;
        this.way = obj.way;
        this.door = obj.door;
        this.area.measureUnit = obj.area.measureUnit || { value: DEFAULT_AREA_UNIT };
        this.areaRepresentation = Utils.getAreaRepresentation(this.area.areaSize, this.area.measureUnit.value);
        this.initialAreaRepresentation = Utils.getAreaRepresentation(
            this.area.initialAreaSize,
            this.area.measureUnit.value,
        );
    }

    public cloneWithConsistencyChange(obj: ParcelSmall, measureUnit?: CodeList): Parcel {
        const newParcel = clone(this);
        if (measureUnit) {
            newParcel.area.measureUnit = measureUnit;
        }
        newParcel.mainParcel = false;
        newParcel.suid = null;
        newParcel.parcelNumber = obj.nicad;
        newParcel.area = obj.area;
        newParcel.area.id = null;
        return newParcel;
    }

    public cloneWithConsistencyChanges = (arr: ParcelSmall[]): Parcel[] =>
        arr.map((parcelSmall) => this.cloneWithConsistencyChange(parcelSmall));
}
