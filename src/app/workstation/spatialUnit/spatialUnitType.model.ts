import { SelectItem } from 'primeng/api';
import { Selectable } from '../../core/interfaces/selectable.interface';

export class SpatialUnitType implements Selectable {
    value: SpatialUnitTypeEnum;

    constructor(value: SpatialUnitTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type SpatialUnitTypeEnum = 'BUILDING' | 'PARCEL' | 'LEGAL_UTILITY';

export const SpatialUnitTypes = {
    BUILDING: 'BUILDING' as SpatialUnitTypeEnum,
    PARCEL: 'PARCEL' as SpatialUnitTypeEnum,
    LEGAL_UTILITY: 'LEGAL_UTILITY' as SpatialUnitTypeEnum,
};
