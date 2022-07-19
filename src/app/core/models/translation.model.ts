import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Language } from '@app/core/models/language.model';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';

export class Translation implements Selectable, ConstructorInterface<Translation> {
    id: string;
    translation: string;
    language: Language;
    private _back?: { translation: string; language: Language };

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.translation = obj.translation;
        this.language = new Language(obj.language || {});
    }

    getConstructor(obj: any): Translation {
        return new Translation(obj);
    }

    backup() {
        this._back = { translation: this.translation, language: this.language };
    }

    restore() {
        if (this._back) {
            this.translation = this._back.translation;
            this.language = this._back.language;
        }
    }

    clearBackup() {
        this._back = null;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.translation,
            value: this,
        };
    }
}
