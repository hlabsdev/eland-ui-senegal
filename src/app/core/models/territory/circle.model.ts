import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Territory } from './territory.model';
import { Region } from './region.model';

export class Circle extends Territory implements Selectable {
    regionId?: string;
    region?: Region;
    regionName:string;

    constructor(obj: any = {}) {
        super(obj);
        this.region = obj.region ? new Region(obj.region) : null;
        this.regionId = obj.region ? obj.region.id : obj.regionId;
        this.regionName = obj.region ? obj.region.name : obj.regionName;

    }
}
