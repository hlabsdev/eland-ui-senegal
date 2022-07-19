import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Locale } from '@app/core/models/locale.model';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { AlertService } from '@app/core/layout/alert/alert.service';
import { TranslationService } from '@app/translation/translation.service';
import { TranslationRepository } from '@app/translation/translation.repository';
import { TableConfig } from '@app/core/models/tableConfig';
import { TableCols } from '@app/core/models/tableCols';

@Component({
    selector: 'app-params-locale',
    templateUrl: './locale.component.html',
})
export class LocaleComponent implements OnInit {
    rowSizes: any = RowSizes;
    locales: Locale[];
    currentLocale: Locale;
    currentLocaleSelected: Locale;
    modalTitle: string;
    modalErrors: any;

    tableConfig: TableConfig = {
        title: this.translateService.instant('PARAMETERS.LOCALE.TITLE'),
        titleTooltip: this.translateService.instant('PARAMETERS.LOCALE.TITLE'),
        loading: false,
        selectByCheckBox: false,
        selectByRadio: false,
        rowSelect: false,
        key: 'formsGroup',
        displayAction: true,
        paginationRow: 10,
        enablePagination: true,
        enableSearchBar: true,
        enableExport: true,
        enableReload: true,
        searchBarField: ['name', 'code'],
        actions: [{
            type: 'edit',
            callback: 'showDialog',
        }]
    }

    cols: TableCols[] = [];

    @ViewChild('lazyCurrentLocale', { read: ViewContainerRef })
    private lazyCurrentFromVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private translateService: TranslateService,
        private translationRepo: TranslationRepository,
        private alertService: AlertService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {
        this.loadData();
        this.translateService
            .get(['PARAMETERS.TERRITORY.COMMON.CODE', 'PARAMETERS.TERRITORY.COMMON.NAME'])
            .subscribe((translate) => {
                this.cols = [
                    { field: 'name', header: translate['PARAMETERS.TERRITORY.COMMON.NAME'], width: '40%', sortable: true, filterable: true, type: 'text' },
                    { field: 'code', header: translate['PARAMETERS.TERRITORY.COMMON.CODE'], width: '40%', sortable: true, filterable: true, type: 'text' },
                ];
            });
    }

    showDialog(locale?: Locale) {
        this.currentLocaleSelected = locale;
        if (locale) {
            this.modalTitle = this.translateService.instant('PARAMETERS.LANGUAGE.EDIT');
            this.currentLocale = _.clone(locale);
        } else {
            this.modalTitle = this.translateService.instant('PARAMETERS.LANGUAGE.ADD');
            this.currentLocale = new Locale({});
        }
        this.lazyLoadElementDialog();
    }

    async lazyLoadElementDialog() {
        if (this.currentLocale) {
            const { LocaleDialogComponent } = await import('./localeDialog.component');
            setTimeout(() => {
                this.lazyCurrentFromVcRef.clear();

                const elementDialog = this.lazyCurrentFromVcRef.createComponent(
                    this.cfr.resolveComponentFactory(LocaleDialogComponent),
                );
                elementDialog.instance.item = this.currentLocale;
                elementDialog.instance.title = this.modalTitle;
                elementDialog.instance.errors = this.modalErrors;
                elementDialog.instance.saved.subscribe(($event) => {
                    this.saved($event);
                });
                elementDialog.instance.canceled.subscribe(() => {
                    this.canceled();
                });
            }, 100);
        }
    }

    saved(locale: Locale) {
        if (!locale.code) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_CODE' };
        } else if (!locale.name) {
            this.modalErrors = { type: 'error', text: 'MESSAGES.TERRITORY.ERRORS.MISSING_NAME' };
        } else {
            this.translationRepo.locale.setOne(locale).subscribe((nLocale) => {
                if (locale.id) {
                    this.locales.splice(this.locales.indexOf(this.currentLocaleSelected), 1, nLocale);
                    this.currentLocaleSelected = null;
                } else {
                    this.locales.push(nLocale);
                }
                this.currentLocale = null;
                this.alertService.success('MESSAGES.LANGUAGE.SAVE_FORM_SUCCESS');
            });
        }
    }

    canceled() {
        this.currentLocale = null;
    }

    loadData() {
        this.translationService.currentLocales$.subscribe((locales) => (this.locales = locales));
    }

    reload(){
        this.loadData();
    }

    call($event){
        var fn = $event[0];
        this[fn]($event[1]);
    }
}
