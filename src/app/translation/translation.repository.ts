import { Injectable } from '@angular/core';
import { RepositoryDataService } from '@app/data/models/repositoryDataService.model';
import { DataElement } from '@app/data/models/dataElement.model';
import { Repository } from '@app/data/models/repository.model';
import { environment as config } from '../../environments/environment';
import { Language } from '@app/core/models/language.model';
import { Locale } from '@app/core/models/locale.model';
import { Section } from '@app/core/models/section.model';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { Translation } from '@app/core/models/translation.model';
import { HttpClient } from '@angular/common/http';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

@Injectable()
export class TranslationRepository extends Repository implements RepositoryDataService {
    private endUrls = {
        section: 'section',
        sectionItem: 'sectionItem',
        translation: 'translation',
        locale: 'locale',
        language: 'language',
        langJson: (inter: any) => `langJson/${inter.code}`,
    };

    language = this.getServices<Language>(this.endUrls.language, (e) => new Language(e));
    locale = this.getServices<Locale>(this.endUrls.locale, (e) => new Locale(e));
    section = this.getServices<Section>(this.endUrls.section, (e) => new Section(e));
    sectionItem = this.getServices<SectionItem>(this.endUrls.sectionItem, (e) => new SectionItem(e));
    translation = this.getServices<Translation>(this.endUrls.translation, (e) => new Translation(e));
    baseFnLangJson = (code: string) => this.getServicesInterpolation(this.endUrls.langJson, { code }).get;
    updateTranslation = (code: string) => (result) => {
        if (result && code) {
            this.translateService.getTranslation(code).subscribe((currentTranslation) => {
                this.translateService.setTranslation(code, _.merge(currentTranslation, result));
            });
        }
    };

    constructor(http: HttpClient, private translateService: TranslateService) {
        super(http, config.translationApi);
    }

    getDataServices = (): DataElement[] => [
        { name: 'locales', serviceNames: ['locales', 'language'], fn: this.locale.getAll },
        { name: 'sections', serviceNames: ['locales', 'language'], fn: this.section.getAll },
        { name: 'languages', serviceNames: ['locales', 'language'], fn: this.language.getAll },
        { name: 'translations', serviceNames: ['locales', 'language'], fn: this.translation.getAll },
        {
            baseName: 'languageJSON',
            serviceNames: ['locales', 'language'],
            baseFn: this.baseFnLangJson,
            baseOn: 'languages',
            baseOnFn: (languages: Language[]) => languages.map((language) => language.locale.code),
            contextSubscriberFn: this.updateTranslation,
        },
    ];
}
