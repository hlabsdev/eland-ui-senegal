import { AreaValue } from '../areaValue.model';

export class ParcelSmall {
    nicad: string;
    area: AreaValue;

    constructor(obj: Partial<ParcelSmall>) {
        this.nicad = obj.nicad;
        this.area = obj.area;
    }
}
