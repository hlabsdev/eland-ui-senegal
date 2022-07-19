import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Territory } from './territory.model';
import { Division } from './division.model';

export class District extends Territory implements Selectable {
    zone: number;
    divisionId?: string;
    divisionName?: string;
    division?: Division;
    constructor(obj: any = {}) {
        super(obj);
        this.zone = obj.zone;
        this.division = obj.division ? new Division(obj.division) : null;
        this.divisionId = obj.division ? obj.division.id : obj.divisionId;
        this.divisionName = obj.division ? obj.division.name : obj.divisionName;

    }
}
