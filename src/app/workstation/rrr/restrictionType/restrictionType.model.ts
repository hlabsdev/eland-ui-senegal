import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';

export class RestrictionType implements Selectable {
    value: RestrictionTypeEnum;

    constructor(value: RestrictionTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type RestrictionTypeEnum =
    | 'AFFECTATION'
    | 'CLASSIFICATION_IN_PUBLIC_DOMAIN'
    | 'MONETARY'
    | 'MORTGAGE'
    | 'LINKED_TO_MORTGAGE'
    | 'COMMAND_OF_FORCED_EXPROPRIATION'
    | 'PREEMPTION_RIGHT'
    | 'TEMPORARY_OCCUPATION_OF_PUBLIC_DOMAIN'
    | 'PRE_NOTATION'
    | 'OTHERS';

export const RestrictionTypes = {
    AFFECTATION: 'AFFECTATION' as RestrictionTypeEnum,
    CLASSIFICATION_IN_PUBLIC_DOMAIN: 'CLASSIFICATION_IN_PUBLIC_DOMAIN' as RestrictionTypeEnum,
    MONETARY: 'MONETARY' as RestrictionTypeEnum,
    MORTGAGE: 'MORTGAGE' as RestrictionTypeEnum,
    LINKED_TO_MORTGAGE: 'LINKED_TO_MORTGAGE' as RestrictionTypeEnum,
    COMMAND_OF_FORCED_EXPROPRIATION: 'COMMAND_OF_FORCED_EXPROPRIATION' as RestrictionTypeEnum,
    PREEMPTION_RIGHT: 'PREEMPTION_RIGHT' as RestrictionTypeEnum,
    TEMPORARY_OCCUPATION_OF_PUBLIC_DOMAIN: 'TEMPORARY_OCCUPATION_OF_PUBLIC_DOMAIN' as RestrictionTypeEnum,
    PRE_NOTATION: 'PRE_NOTATION' as RestrictionTypeEnum,
    OTHERS: 'OTHERS' as RestrictionTypeEnum,
};
