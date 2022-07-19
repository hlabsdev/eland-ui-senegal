import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';
import { ExtendedCodelist } from './extendedCodeList.model';

export class Checklist implements Selectable {
    type: string;
    label: string;
    items: ExtendedCodelist[];

    constructor(obj: any = {}) {
        this.type = obj.type;
        this.label = obj.label;
        this.items = obj.items ? obj.items.map((item) => new ExtendedCodelist(item)) : [];
    }
    toSelectItem(): SelectItem {
        return {
            label: this.label,
            value: this.type,
        };
    }
}
