import { SpatialUnit } from '@app/workstation/spatialUnit/spatialUnit.model';

export class Building extends SpatialUnit {
    category: string;
    type: string;
    description: string;
    primaryUsage: string;
    numberOfFloors: number;
    buildingNumber: string;
    buildingParcelNumbers: string;

    constructor(obj: any = {}) {
        super(obj);
        this.category = obj.category;
        this.type = obj.type;
        this.description = obj.description;
        this.primaryUsage = obj.primaryUsage;
        this.numberOfFloors = obj.numberOfFloors;
        this.buildingNumber = obj.buildingNumber;
        this.buildingParcelNumbers = obj.buildingParcelNumbers;
    }
}
