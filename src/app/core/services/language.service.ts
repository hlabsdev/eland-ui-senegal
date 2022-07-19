import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpParams } from '@angular/common/http';

@Injectable()
export class LanguageService {
    constructor(private translate: TranslateService) {}

    /**
     * Returns an object with an HttpParams object for `langCode` based on
     * the current language configured.
     */
    setLangCodeParam(): any {
        const currentLocale = this.translate.currentLang;
        const languageCode = currentLocale.split('-');
        return {
            params: new HttpParams().set('langCode', languageCode[0]),
        };
    }
}
