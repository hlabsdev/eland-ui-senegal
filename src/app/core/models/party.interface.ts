import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { Variables } from '@app/core/models/variables.model';

export interface IParty {
    getName(): string;
    getSelectItem(): SelectItem;
    serialize(): Variables;
    serializeWithoutId(): Variables;
}
