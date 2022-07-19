import Utils from '@app/core/utils/utils';
import { SpatialUnit } from './spatialUnit.model';

export class SpatialUnitGroup {
    id: string;
    sugId: string;
    name: string;
    label: string;
    hierachyLevel: number;
    spatialUnits: SpatialUnit[];
    modDate: Date;
    modUser: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.sugId = obj.sugId;
        this.name = obj.name;
        this.label = obj.label;
        this.hierachyLevel = obj.hierachyLevel;
        // this.spatialUnits = obj.spatialUnits ? obj.spatialUnits.map(su => Utils.manageSpatialUnitPolymorphism(su)) : [];
        this.modDate = Utils.setDate(obj.modDate);
        this.modUser = obj.modUser;
    }
}
