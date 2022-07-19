import { SelectItem } from 'primeng/api';
import { Selectable } from '../../../core/interfaces/selectable.interface';

export class RRRType implements Selectable {
    value: RRRTypeEnum;

    constructor(value: RRRTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type RRRTypeEnum = 'RESTRICTION' | 'RIGHT' | 'RESPONSIBILITY';

export const RRRTypes = {
    RESTRICTION: 'RESTRICTION' as RRRTypeEnum,
    RIGHT: 'RIGHT' as RRRTypeEnum,
    RESPONSIBILITY: 'RESPONSIBILITY' as RRRTypeEnum,
};
