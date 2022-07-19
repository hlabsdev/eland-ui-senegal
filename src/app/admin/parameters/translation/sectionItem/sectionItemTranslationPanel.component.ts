import { Component, Input, OnInit } from '@angular/core';
import { Translation } from '@app/core/models/translation.model';
import * as _ from 'lodash';
import { RowSizes } from '@app/core/models/rowSize.model';
import { SelectItem } from 'primeng/api';
import { Language } from '@app/core/models/language.model';
import { TranslationService } from '@app/translation/translation.service';
import { TranslateService } from '@ngx-translate/core';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { TranslationRepository } from '@app/translation/translation.repository';

@Component({
    selector: 'app-translation-translation-panel',
    templateUrl: './sectionItemTranslationPanel.component.html',
})
export class SectionItemTranslationPanelComponent implements OnInit {
    rowSizes: any = RowSizes;
    tmpNewTranslation;
    selectedTranslation;
    languages: Language[];
    sectionItem: SectionItem;

    @Input() options: { localSave?: boolean } = {};

    languagesSelectItem: SelectItem[] = [];
    columns: any[];

    constructor(
        private translationService: TranslationService,
        private translateService: TranslateService,
        private sectionsService: SectionsService,
        private translationRepo: TranslationRepository,
    ) {
        this.translationService.currentLanguages$.subscribe((languages) => {
            this.languages = languages || this.languages;
            if (this.languages && this.languages.length > 0) {
                this.languagesSelectItem = this.languages.map((language) => language.toSelectItem());
                this.languagesSelectItem.unshift({
                    label: this.translateService.instant('TRANSLATION.SECTION_ITEM.ADD_LANGUAGE'),
                    disabled: true,
                } as SelectItem);
            }
        });

        this.sectionsService.currentSectionItem$.subscribe((sectionItem) => (this.sectionItem = sectionItem));
    }

    ngOnInit() {
        this.columns = [
            { field: 'language.name', header: 'TRANSLATION.SECTION_ITEM.TRANSLATION', width: '40%' },
            { field: 'translation', header: 'TRANSLATION.SECTION_ITEM.TRANSLATION', width: '40%' },
        ];
    }

    editItem(translation: Translation) {
        translation.backup();
        this.selectedTranslation = translation;
    }

    getItem(item, field): string {
        return _.get(item, field);
    }

    cancelItem(translation: Translation) {
        if (this.tmpNewTranslation === translation) {
            this.sectionItem.translations = _.remove(this.sectionItem.translations, this.tmpNewTranslation);
            this.tmpNewTranslation = null;
        } else {
            translation.restore();
            this.selectedTranslation = null;
        }
    }

    saveItem(translation: Translation) {
        if (this.tmpNewTranslation === translation) {
            this.tmpNewTranslation = null;
        } else {
            translation.clearBackup();
            this.selectedTranslation = null;
        }
        if (this.options.localSave) {
            this.translationRepo.sectionItem.setOne(this.sectionItem).subscribe();
        }
    }

    addItem() {
        this.tmpNewTranslation = new Translation({});
        this.sectionItem.translations = this.sectionItem.translations || [];
        this.sectionItem.translations.push(this.tmpNewTranslation);
    }

    getLanguagesOptions(item: Translation) {
        const mapLangs = this.sectionItem.translations.map((trans) => trans.language.id);
        return _.forEach(this.languagesSelectItem, (lang) => {
            if (lang.value) {
                lang.disabled = mapLangs.includes(lang.value.id) && lang.value !== item.language;
            }
        });
    }
}
