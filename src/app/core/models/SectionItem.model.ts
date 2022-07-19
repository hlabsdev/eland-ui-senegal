import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Translation } from '@app/core/models/translation.model';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';
import { Section } from '@app/core/models/section.model';

export class SectionItem implements Selectable, ConstructorInterface<SectionItem> {
    id: string;
    key: string;
    section: Partial<Section>;
    parent: Section;
    translationsMap: any;
    translations: Translation[];

    constructor(obj: Partial<SectionItem> = {}, parent?: Section) {
        this.updatePrimaryElements(obj);
        this.updateTranslationMap(obj);
        this.setParent(parent);
    }

    getConstructor(obj: any): SectionItem {
        return new SectionItem(obj);
    }

    setParent(section?: Section): SectionItem {
        if (section) {
            this.parent = section;
            this.section = section.simplify();
        }
        return this;
    }

    update(sectionItem: SectionItem) {
        if (!this.id) {
            this.parent.sectionItems.push(this);
        }
        this.updatePrimaryElements(sectionItem);
        this.updateTranslationMap(sectionItem);
    }

    private updatePrimaryElements(obj: Partial<SectionItem>) {
        this.id = obj.id;
        this.key = obj.key;
        this.section = obj.section;
    }

    private updateTranslationMap(obj: Partial<SectionItem> = {}) {
        this.translationsMap = {};
        this.translations =
            obj.translations && obj.translations.length
                ? obj.translations.map((translation) => {
                      const tmp = new Translation(translation);
                      this.translationsMap[tmp.language.id] = translation.translation;
                      return tmp;
                  })
                : [];
    }

    simplify = (): Partial<SectionItem> => ({
        id: this.id,
        key: this.key,
        section: this.section,
        translations: this.translations,
    });

    toSelectItem(): SelectItem {
        return {
            label: this.key,
            value: this,
        };
    }
}
