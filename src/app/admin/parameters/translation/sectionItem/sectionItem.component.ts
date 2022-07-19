import { Component, ComponentFactoryResolver, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { SectionItem } from '@app/core/models/SectionItem.model';
import { Language } from '@app/core/models/language.model';
import * as _ from 'lodash';
import { TranslateService } from '@ngx-translate/core';
import { Section } from '@app/core/models/section.model';
import { TranslationService } from '@app/translation/translation.service';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { TranslationRepository } from '@app/translation/translation.repository';

@Component({
    selector: 'app-translation-item',
    templateUrl: './sectionItem.component.html',
})
export class SectionItemComponent implements OnInit {
    rowSizes: any = RowSizes;
    items: SectionItem[];
    columns: any[];
    languages: Language[];
    currentSection: Section;
    selectedItem: SectionItem;
    modalVisible = false;

    @ViewChild('lazyTranslationItem', { read: ViewContainerRef })
    private lazyTranslationItemVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private translationRepo: TranslationRepository,
        private sectionsService: SectionsService,
        private translateService: TranslateService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {}

    ngOnInit() {
        this.sectionsService.selectedSection$.subscribe((currentSection) => {
            if (currentSection) {
                this.currentSection = currentSection;
                this.items = currentSection.sectionItems;
            } else {
                this.currentSection = null;
                this.items = [];
            }
            this.setItemsColumns();
        });

        this.translationService.currentLanguages$.subscribe((languages) => {
            this.languages = languages;
            this.setItemsColumns();
        });
    }

    setItemsColumns() {
        this.columns = [{ field: 'key', header: this.translateService.instant('TRANSLATION.ITEMS.KEY'), width: '15%' }];
        (this.languages || []).forEach((language) =>
            this.columns.push({ field: 'translationsMap.' + language.id, header: language.name }),
        );
    }

    editItem(item: SectionItem) {
        this.sectionsService.selectSectionItem(item);
        this.modalVisible = true;
        this.lazyLoadElementDialog();
    }

    addItemSection() {
        this.sectionsService.selectSectionItem(new SectionItem({}).setParent(this.currentSection));
        this.modalVisible = true;
        this.lazyLoadElementDialog();
    }

    cancelModal() {
        this.sectionsService.clearSectionItemSelection();
        this.selectedItem = null;
        this.modalVisible = false;
    }

    hideModal() {
        this.selectedItem = null;
        this.modalVisible = false;
    }

    saveModal(sectionItem: SectionItem) {
        this.translationRepo.sectionItem.setOne(sectionItem.simplify()).subscribe((newSectionItem) => {
            sectionItem.update(newSectionItem);
            this.setItemsColumns();
            this.modalVisible = false;
        });
    }

    getItem(item: SectionItem, field: string): string {
        return _.get(item, field);
    }

    async lazyLoadElementDialog() {
        if (this.modalVisible) {
            const { SectionItemModalComponent } = await import('./sectionItem.modal.component');
            setTimeout(() => {
                this.lazyTranslationItemVcRef.clear();

                const elementDialog = this.lazyTranslationItemVcRef.createComponent(
                    this.cfr.resolveComponentFactory(SectionItemModalComponent),
                );
                elementDialog.instance.visible = this.modalVisible;
                elementDialog.instance.onSave.subscribe(($event: any) => {
                    this.saveModal($event);
                });
                elementDialog.instance.onHide.subscribe(() => {
                    this.hideModal();
                });
                elementDialog.instance.onCancel.subscribe(() => {
                    this.cancelModal();
                });
            }, 100);
        }
    }
}
