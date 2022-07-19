import { ComponentFactoryResolver } from '@angular/core';
import { Component, AfterViewInit, ViewChild, ViewContainerRef } from '@angular/core';
import { Section } from '@app/core/models/section.model';
import { TranslationService } from '@app/translation/translation.service';

@Component({
    selector: 'app-sidemenu',
    templateUrl: './sidemenu.component.html',
    styleUrls: ['./sidemenu.component.scss'],
})
export class SideMenuComponent implements AfterViewInit {
    showAddSection = false;
    currentEditSection: Section;
    sections: Section[];

    @ViewChild('lazySideMenuItem', { read: ViewContainerRef })
    private lazySideMenuItemVcRef: ViewContainerRef;

    constructor(
        private translationService: TranslationService,
        private viewContainerRef: ViewContainerRef,
        private cfr: ComponentFactoryResolver,
    ) {
        this.translationService.currentSections$.subscribe((sections) => {
            this.sections = sections;
        });
    }

    ngAfterViewInit(): void {
        this.lazyLoadSideMenuItem();
    }

    async lazyLoadSideMenuItem() {
        const { SideMenuItemComponent } = await import('./sidemenuItem.component');
        this.lazySideMenuItemVcRef.clear();
        const menuItem = this.lazySideMenuItemVcRef.createComponent(
            this.cfr.resolveComponentFactory(SideMenuItemComponent),
        );
        menuItem.instance.mode = { add: true };
    }
}
