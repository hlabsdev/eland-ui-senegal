import { Injectable } from '@angular/core';
import { DataService } from '@app/data/data.service';
import { Section } from '@app/core/models/section.model';
import { Observable } from 'rxjs';
import { Locale } from '@app/core/models/locale.model';
import { Language } from '@app/core/models/language.model';

@Injectable()
export class TranslationService {
    constructor(private dataService: DataService) {}

    public currentSections$: Observable<Section[]> = this.dataService.getDataElement$('sections');
    public currentLocales$: Observable<Locale[]> = this.dataService.getDataElement$('locales');
    public currentLanguages$: Observable<Language[]> = this.dataService.getDataElement$('languages');

    public getSectionByKey = (key: string) =>
        this.currentSections$.subscribe((sections) => {
            const find = (fSections: Section[]) => {
                fSections.forEach((section) => {
                    if (section.name === key) {
                        return section;
                    } else {
                        return find(section.subSections);
                    }
                });
            };
            return find(sections);
        });

    public getSectionItemByKey = (key: string, parent?: Section) =>
        parent.sectionItems.forEach((sectionItem) => {
            if (sectionItem.key === key) {
                return sectionItem;
            }
        });

    // TODO :: finish app settings
    // TODO :: load languages from backend app settings
    // TODO :: language load fromUrlJSon from backend
    // TODO :: language modification by json
    // TODO :: google translate api frontend/ backend ( see best implemetation )
    // TODO :: better handling of data while something change to not friendly fire the backend with the data cahnge
    // TODO :: profile settings save in the backend
}
