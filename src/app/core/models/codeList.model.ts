import { SelectItem } from 'primeng/api';
import { Selectable } from '../interfaces/selectable.interface';

export class CodeList implements Selectable {
    [x: string]: any;
    codeListID: string;
    value: string;
    type: string;
    description: string;
    id: string;
    sigtasId: any;
    isSystemAssign: boolean;

    constructor(obj: any = {}) {
        this.codeListID = obj.codeListID;
        this.value = obj.value;
        this.type = obj.type;
        this.description = obj.description;
        this.id = obj.codeListID;
        this.sigtasId = obj.sigtasId;
        this.isSystemAssign = obj.isSystemAssign;
    }

    public toSelectItem(): SelectItem {
        return { label: this.value, value: this };
    }
}
