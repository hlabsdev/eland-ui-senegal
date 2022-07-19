import { Component, ComponentFactoryResolver, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Section } from '@app/core/models/section.model';
import { TranslationService } from '@app/translation/translation.service';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { TranslationRepository } from '@app/translation/translation.repository';
import * as _ from 'lodash';

@Component({
    selector: 'app-translation-section',
    templateUrl: './section.component.html',
})
export class SectionComponent {
    rowSizes: any = RowSizes;
    errors: any;
    @Input() sections: Section[];

    modalVisible = false;
    currentSection: Section;
    currentAdd: Section;
    parent: Section;

    @ViewChild('lazyCurrentAdd', { read: ViewContainerRef })
    private lazyCurrentAddVcRef: ViewContainerRef;

    @ViewChild('lazyTranslationItem', { read: ViewContainerRef })
    private lazyTranslationItemVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private sectionsService: SectionsService,
        private translationRepo: TranslationRepository,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        this.sectionsService.selectedSection$.subscribe((currentSection) => {
            this.currentSection = currentSection;
            this.lazyLoadTranslationItem();
        });
        this.sectionsService.currentAdd$.subscribe((section) => {
            this.currentAdd = section;
            this.modalVisible = !!this.currentAdd;
            if (this.modalVisible === true) {
                this.lazyLoadElementDialog();
            }
        });
    }

    async lazyLoadTranslationItem() {
        if (this.currentSection != null) {
            const { SectionItemComponent } = await import('../sectionItem/sectionItem.component');
            setTimeout(() => {
                this.lazyTranslationItemVcRef.clear();
                this.lazyTranslationItemVcRef.createComponent(this.cfr.resolveComponentFactory(SectionItemComponent));
            }, 200);
        }
    }

    editSection = () => {
        this.modalVisible = true;
        this.lazyLoadElementDialog();
    };

    cancelModal = () => this.sectionsService.addSection(null);

    hideModal = () => (this.modalVisible = false);

    saveModal() {
        this.translationRepo.section.setOne(this.currentAdd.simplify()).subscribe((newSection) => {
            this.currentAdd.update(newSection);
            this.sectionsService.selectSection(this.currentAdd);
            this.modalVisible = false;
        });
    }

    async lazyLoadElementDialog() {
        if (this.modalVisible) {
            const { SectionModalComponent } = await import('./section.modal.component');
            setTimeout(() => {
                this.lazyCurrentAddVcRef.clear();
                const elementDialog = this.lazyCurrentAddVcRef.createComponent(
                    this.cfr.resolveComponentFactory(SectionModalComponent),
                );
                elementDialog.instance.visible = this.modalVisible;
                elementDialog.instance.section = this.currentAdd;
                elementDialog.instance.onCancel.subscribe(() => {
                    this.cancelModal();
                });
                elementDialog.instance.onHide.subscribe(() => {
                    this.hideModal();
                });

                elementDialog.instance.onSave.subscribe(() => {
                    this.saveModal();
                });
            }, 100);
        }
    }

    onSectionSelect = (item: Section) => this.sectionsService.selectSection(item);

    onSectionEdit = (item: Section) => {};

    /**
     *
     * the section is not set correctly in the popup panel this is why we have an issue here
     */
}
