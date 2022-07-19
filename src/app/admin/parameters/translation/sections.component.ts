import { Component, ComponentFactoryResolver, ViewChild, ViewContainerRef, AfterViewInit } from '@angular/core';
import { RowSizes } from '@app/core/models/rowSize.model';
import { Section } from '@app/core/models/section.model';
import { TranslationService } from '@app/translation/translation.service';

@Component({
    selector: 'app-params-translation',
    templateUrl: './sections.component.html',
    styleUrls: ['./sections.component.scss'],
})
export class SectionsComponent implements AfterViewInit {
    rowSizes: any = RowSizes;
    currentSections: Section[];

    @ViewChild('lazyTranslationSection', { read: ViewContainerRef })
    private lazyTranslationSectionVcRef: ViewContainerRef;

    @ViewChild('lazySideMenu', { read: ViewContainerRef })
    private lazySideMenuVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        this.translationService.currentSections$.subscribe((currentSections) => {
            this.currentSections = currentSections;
            this.lazyLoadElementDialog();
        });
    }

    ngAfterViewInit(): void {
        this.lazyLoadSideMenu();
    }

    /**
     * TODO :: missing confirmation popup when adding section and sectionItem
     */

    async lazyLoadSideMenu() {
        const { SideMenuComponent } = await import('./sidemenu/sidemenu.component');
        this.lazySideMenuVcRef.clear();
        this.lazySideMenuVcRef.createComponent(this.cfr.resolveComponentFactory(SideMenuComponent));
    }

    async lazyLoadElementDialog() {
        if (this.currentSections) {
            const { SectionComponent } = await import('./section/section.component');
            setTimeout(() => {
                this.lazyTranslationSectionVcRef.clear();
                const elementDialog = this.lazyTranslationSectionVcRef.createComponent(
                    this.cfr.resolveComponentFactory(SectionComponent),
                );
                elementDialog.instance.sections = this.currentSections;
            }, 100);
        }
    }
}
