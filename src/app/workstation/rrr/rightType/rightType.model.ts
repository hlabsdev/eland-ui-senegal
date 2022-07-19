import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';

export class RightType implements Selectable {
    value: RightTypeEnum;

    constructor(value: RightTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type RightTypeEnum = 'FREEHOLD' | 'LEASEHOLD' | 'SUBLEASE' | 'DUPLICATE' | 'SERVITUDE' | 'USUFRUCT' | 'OTHERS';

export const RightTypes = {
    FREEHOLD: 'FREEHOLD' as RightTypeEnum,
    LEASEHOLD: 'LEASEHOLD' as RightTypeEnum,
    SUBLEASE: 'SUBLEASE' as RightTypeEnum,
    DUPLICATE: 'DUPLICATE' as RightTypeEnum,
    SERVITUDE: 'SERVITUDE' as RightTypeEnum,
    USUFRUCT: 'USUFRUCT' as RightTypeEnum,
    OTHERS: 'OTHERS' as RightTypeEnum,
};
