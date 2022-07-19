import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';

export class Locale implements Selectable, ConstructorInterface<Locale> {
    id: string;
    name: string;
    code: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.code = obj.code;
        return this;
    }

    getConstructor(obj: any): Locale {
        return new Locale(obj);
    }

    toSelectItem(): SelectItem {
        return {
            label: `${this.name} (${this.code})`,
            value: this,
        };
    }
}
