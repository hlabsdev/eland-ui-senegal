import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Territory } from './territory.model';

export class Country extends Territory implements Selectable {
    constructor(obj: any = {}) {
        super(obj);
    }
}
