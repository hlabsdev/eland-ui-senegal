import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';
import { Locale } from './locale.model';

export class Language implements Selectable, ConstructorInterface<Language> {
    id: string;
    name: string;
    locale: Locale;
    isRTL: boolean;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.locale = new Locale(obj.locale);
        this.isRTL = obj.isRTL || false;
        return this;
    }

    getConstructor(obj: any): Language {
        return new Language(obj);
    }

    toSelectItem(): SelectItem {
        return {
            label: `${this.name} (${this.locale.code})`,
            value: this,
        };
    }
}
