import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';

export class AreaMeasurementUnit implements Selectable {
    value: AreaMeasurementUnitEnum;

    constructor(value: AreaMeasurementUnitEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type AreaMeasurementUnitEnum = 'MEASURE_UNIT_HECTARE' | 'MEASURE_UNIT_ARES' | 'MEASURE_UNIT_CENTIARE';

export const AreaMeasurementUnits = {
    MEASURE_UNIT_HECTARE: 'MEASURE_UNIT_HECTARE' as AreaMeasurementUnitEnum,
    MEASURE_UNIT_ARES: 'MEASURE_UNIT_ARES' as AreaMeasurementUnitEnum,
    MEASURE_UNIT_CENTIARE: 'MEASURE_UNIT_CENTIARE' as AreaMeasurementUnitEnum,
};
