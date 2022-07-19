import { SelectItem } from 'primeng/api';
import { Selectable } from '../interfaces/selectable.interface';

export class ApplicationStatus implements Selectable {
    value: ApplicationStatusEnum;

    constructor(value: ApplicationStatusEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type ApplicationStatusEnum = 'IN_PROGRESS' | 'COMPLETED' | 'CANCEL';

export const ApplicationsStatus = {
    IN_PROGRESS: 'IN_PROGRESS' as ApplicationStatusEnum,
    COMPLETED: 'COMPLETED' as ApplicationStatusEnum,
    CANCEL: 'CANCEL' as ApplicationStatusEnum,
};
