import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';

export class Territory implements Selectable {
    id: string;
    code: string;
    name: string;
    description: string;
    startDate: Date;
    endDate: Date;
    sigtasId: string;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.code = obj.code;
        this.name = obj.name;
        this.description = obj.description;
        this.startDate = obj.startDate;
        this.endDate = obj.endDate;
        this.sigtasId = obj.sigtasId;
    }

    toSelectItem(): SelectItem {
        return {
            label: `${this.name}`,
            value: this,
        };
    }

    toNameSelectItem(): SelectItem {
        return {
            label: `${this.name}`,
            value: this.name,
        };
    }
}
