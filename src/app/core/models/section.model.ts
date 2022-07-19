import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { ConstructorInterface } from '@app/core/interfaces/constructor.interface';

export class Section implements Selectable, ConstructorInterface<Section> {
    id: string;
    name: string;
    subSections: Section[];
    sectionItems: SectionItem[];
    section: Partial<Section>;
    parent: Section;
    level: number;
    open: boolean;

    constructor(obj: Partial<Section> = {}) {
        this.updatePrimaryElements(obj);
        this.subSections = (obj.subSections || []).map((section) => new Section(section));
        this.sectionItems = (obj.sectionItems || []).map((item) => new SectionItem(item));
    }

    getConstructor(obj: any): Section {
        return new Section(obj);
    }

    setParent(section?: Section, level?: number): Section {
        if (section) {
            this.parent = section;
            this.section = section.simplify();
        }
        this.level = level;
        return this;
    }

    getParent = (): { parent: Partial<Section>; level: number } => ({ parent: this.section, level: this.level });

    toSelectItem(): SelectItem {
        return {
            label: this.name,
            value: this,
        };
    }

    public updatePrimaryElements(section: Partial<Section> = {}) {
        this.id = section.id;
        this.name = section.name;
    }

    public update(section: Partial<Section>, parentSections?: Section[]) {
        if (!this.id) {
            if (this.parent) {
                this.parent.subSections.push(this);
            } else if (parentSections) {
                parentSections.push(this);
            }
        }
        this.updatePrimaryElements(section);
    }

    simplify = (): Partial<Section> => ({
        id: this.id,
        name: this.name,
        section: this.section,
    });
}
