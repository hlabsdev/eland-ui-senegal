import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Territory } from './territory.model';
import { Country } from './country.model';

export class Region extends Territory implements Selectable {
    countryId?: string;
    countryName:string;
    country?: Country;
    constructor(obj: any = {}) {
        super(obj);
        this.country = obj.country ? new Country(obj.country) : null;
        this.countryId = obj.country ? obj.country.id : obj.countryId;
        this.countryName = obj.country ? obj.country.name : obj.countryName;

    }
}
