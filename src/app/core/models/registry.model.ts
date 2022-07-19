import * as _ from 'lodash';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';
import { CodeList } from './codeList.model';

export class Registry implements Selectable {
    id: string;
    code: string;
    name: string;
    description: string;
    titleType: CodeList;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.code = obj.code;
        this.name = obj.name;
        this.description = obj.description;
        this.titleType = obj.titleType ? new CodeList(obj.titleType) : null;
    }

    public toSelectItem(): SelectItem {
        return { label: `${this.name}`, value: this };
    }
    public toNameSelectItem(): SelectItem {
        return { label: `${this.name}`, value: this.name };
    }
}
