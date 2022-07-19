import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';

export class TaxCenter implements Selectable {
    id: string;
    description: string;
    code: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.description = obj.description;
        this.code = obj.code;
    }

    toSelectItem(): SelectItem {
        return {
            label: `${this.description} (${this.code})`,
            value: this.id,
        };
    }
    public toNameSelectItem(): SelectItem {
        return { label: `${this.description}`, value: this.description };
    }
}
