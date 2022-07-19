import { AreaMeasurementUnitEnum as AreaMeasurmentUnitEnum } from '@app/workstation/spatialUnit/areaMeasurementUnit.model';

export interface AreaUnitConvertion {
    from: AreaMeasurmentUnitEnum;
    to: AreaMeasurmentUnitEnum;
    convertionFactor: number;
}
