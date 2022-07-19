import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    AfterViewInit,
    ComponentFactoryResolver,
    ViewChild,
    ViewContainerRef,
} from '@angular/core';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { Language } from '@app/core/models/language.model';
import { SelectItem } from 'primeng/api';
import { RowSizes } from '@app/core/models/rowSize.model';
import * as _ from 'lodash';
import { Translation } from '@app/core/models/translation.model';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '@app/translation/translation.service';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { replaceSpaceAndAutoMaj } from '@app/admin/parameters/translation/sectionItem/utils';

@Component({
    selector: 'app-translation-item-modal',
    templateUrl: './sectionItem.modal.component.html',
})
export class SectionItemModalComponent implements OnInit, AfterViewInit {
    rowSizes: any = RowSizes;
    @Input() visible = false;
    sectionItem: SectionItem;
    languages: Language[];
    @Input() languagesSelectItem: SelectItem[];
    languagesItem: SelectItem[];
    columns: any[];
    selectedTranslation: Translation;
    backSelect: Translation;
    tmpNewTranslation: Translation;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onHide: EventEmitter<any> = new EventEmitter<any>();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onSave: EventEmitter<SectionItem> = new EventEmitter<SectionItem>();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild('lazyTranslationPanel', { read: ViewContainerRef })
    private lazyTranslationPanelVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private translateService: TranslateService,
        private sectionsService: SectionsService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
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

    get sectionItemJSON() {
        return JSON.stringify(this.sectionItem, null, 2);
    }

    ngOnInit() {
        this.columns = [
            { field: 'language.name', header: 'TRANSLATION.SECTION_ITEM.TRANSLATION', width: '40%' },
            { field: 'translation', header: 'TRANSLATION.SECTION_ITEM.TRANSLATION', width: '40%' },
        ];
    }

    async ngAfterViewInit() {
        const { SectionItemTranslationPanelComponent } = await import('./sectionItemTranslationPanel.component');
        this.lazyTranslationPanelVcRef.clear();
        this.lazyTranslationPanelVcRef.createComponent(
            this.cfr.resolveComponentFactory(SectionItemTranslationPanelComponent),
        );
    }

    hide = () => this.onHide.emit(null);
    save = () => this.onSave.emit(this.sectionItem);
    cancel = () => this.onCancel.emit(null);

    editItem(translation: Translation) {
        translation.backup();
        this.selectedTranslation = translation;
    }

    getItem(item, field): string {
        return _.get(item, field);
    }

    getLanguagesOptions(item: Translation) {
        const mapLangs = this.sectionItem.translations.map((trans) => trans.language.id);
        return _.forEach(this.languagesSelectItem, (lang) => {
            if (lang.value) {
                lang.disabled = mapLangs.includes(lang.value.id) && lang.value !== item.language;
            }
        });
    }

    replaceSpaceAndAutoMaj() {
        this.sectionItem.key = replaceSpaceAndAutoMaj(this.sectionItem.key);
    }
}
