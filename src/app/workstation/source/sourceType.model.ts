import { SelectItem } from 'primeng/api';
import { Selectable } from '../../core/interfaces/selectable.interface';

export class SourceType implements Selectable {
    value: SourceTypeEnum;

    constructor(value: SourceTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type SourceTypeEnum = 'ADMINISTRATIVE_SOURCE' | 'SPATIAL_SOURCE' | 'SUPPORT_SOURCE';

export const SourceTypes = {
    ADMINISTRATIVE_SOURCE: 'ADMINISTRATIVE_SOURCE' as SourceTypeEnum,
    SPATIAL_SOURCE: 'SPATIAL_SOURCE' as SourceTypeEnum,
    SUPPORT_SOURCE: 'SUPPORT_SOURCE' as SourceTypeEnum,
    CHEQUE: 'CHEQUE' as SourceTypeEnum,
};
