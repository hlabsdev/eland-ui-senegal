import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Language } from '@app/core/models/language.model';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/api';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslationService } from '@app/translation/translation.service';
import { TranslationRepository } from '@app/translation/translation.repository';
import { TableCols } from '@app/core/models/tableCols';
import { TableConfig } from '@app/core/models/tableConfig';

@Component({
    selector: 'app-params-language',
    templateUrl: './language.component.html',
})
export class LanguageComponent implements OnInit {
    rowSizes: any = RowSizes;
    languages: Language[];
    currentLanguage: Language;
    currentLanguageSelected: Language;
    modalTitle: string;
    modalErrors: any;
    locales: SelectItem[] = [];

    @ViewChild('lazyCurrentLanguage', { read: ViewContainerRef })
    private lazyCurrentLanguageVcRef: ViewContainerRef;

    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.LANGUAGE.TITLE'),
        titleTooltip: this.translateService.instant('PARAMETERS.LANGUAGE.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'languages',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['name', 'locale', 'isRTL'],
        actions: [{
            type: 'edit',
            callback: 'showDialog',
        }]
    }

    cols: TableCols[] = [];

    constructor(
        private translationService: TranslationService,
        private translationRepo: TranslationRepository,
        private translateService: TranslateService,
        private alertService: AlertService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {
        this.loadData();
        this.translateService
            .get(['PARAMETERS.TERRITORY.COMMON.CODE', 'PARAMETERS.TERRITORY.COMMON.NAME', 'PARAMETERS.TRANSLATION.ISRTL'])
            .subscribe((translate) => {
                this.cols = [
                    { field: 'name', header: translate['PARAMETERS.TERRITORY.COMMON.NAME'], sortable: true, filterable: true, type: 'text', width: '40%' },
                    { field: 'locale', header: translate['PARAMETERS.TERRITORY.COMMON.CODE'], sortable: true, filterable: true, type: 'text', width: '30%' },
                    { field: 'isRTL', header: translate['PARAMETERS.TRANSLATION.ISRTL'], sortable: true, filterable: true, type: 'text', width: '30%' },
                ];
            });
    }

    showDialog(language?: Language) {
        this.currentLanguageSelected = language;
        if (language) {
            this.modalTitle = this.translateService.instant('PARAMETERS.LANGUAGE.EDIT');
            this.currentLanguage = _.clone(language);
        } else {
            this.modalTitle = this.translateService.instant('PARAMETERS.LANGUAGE.ADD');
            this.currentLanguage = new Language({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentLanguage) {
            const { LanguageDialogComponent } = await import('./languageDialog.component');
            setTimeout(() => {
                this.lazyCurrentLanguageVcRef.clear();

                const elementDialog = this.lazyCurrentLanguageVcRef.createComponent(
                    this.cfr.resolveComponentFactory(LanguageDialogComponent),
                );
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.item = this.currentLanguage;
                elementDialog.instance.errors = this.modalErrors;
                elementDialog.instance.locales = this.locales;
                elementDialog.instance.saved.subscribe(($event: any) => {
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    saved(language: Language) {
        if (!language.locale) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_LOCALE' };
        } else if (!language.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else {
            this.translationRepo.language.setOne(language).subscribe((nLanguage) => {
                if (language.id) {
                    this.languages.splice(this.languages.indexOf(this.currentLanguageSelected), 1, nLanguage);
                    this.currentLanguageSelected = null;
                } else {
                    this.languages.push(nLanguage);
                }
                this.currentLanguage = null;
                this.alertService.success('MESSAGES.LANGUAGE.SAVE_FORM_SUCCESS');
            });
        }

        /**
    TODO :: 1- update global locales to be use afterward
            2- update global languages to be use afterward
            3- create mew services for locale, language, translation seperatetly
       */
    }

    canceled = () => (this.currentLanguage = null);

    loadData() {
        this.translationService.currentLanguages$.subscribe(
            (languages) => (this.languages = languages || this.languages),
        );
        this.translationService.currentLocales$.subscribe((locales) => {
            this.locales = (locales && locales.map((locale) => locale.toSelectItem())) || this.locales;
            this.locales.unshift({ label: this.translateService.instant('COMMON.ACTION.SELECT'), value: null });
        });
    }

    reload(){
        this.loadData();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
