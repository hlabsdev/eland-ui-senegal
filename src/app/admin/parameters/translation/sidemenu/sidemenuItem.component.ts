import { animate, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SectionsService } from '@app/admin/parameters/translation/sections.service';
import { Section } from '@app/core/models/section.model';
import { TranslationService } from '@app/translation/translation.service';

@Component({
    selector: 'app-sidemenu-item',
    templateUrl: './sidemenuItem.component.html',
    styleUrls: ['./sidemenuItem.component.scss'],
    animations: [
        trigger('inOutAnimation', [
            transition(':enter', [
                style({ height: 0, opacity: 0 }),
                animate('500ms ease-out', style({ height: 35, opacity: 1 })),
            ]),
            transition(':leave', [
                style({ height: 35, opacity: 1 }),
                animate('500ms ease-in', style({ height: 0, opacity: 0 })),
            ]),
        ]),
    ],
})
export class SideMenuItemComponent implements OnChanges {
    @Input() mode: { add?: boolean; show?: boolean } = { show: true };
    @Input() sections: Section[] = [];
    @Input() section: Section;
    @Input() reset: boolean;
    @Input() level = 0;
    @Input() parent: Section;
    mouseover: boolean;
    @Output() addSection: EventEmitter<Section> = new EventEmitter<Section>();
    state = 'enter';
    selected = true;
    isParent = false;
    currentSection: Section;
    subSections: Section[];

    constructor(private translationService: TranslationService, private sectionsService: SectionsService) {
        this.sectionsService.selectedSection$.subscribe((currentSection: Section) => {
            this.currentSection = currentSection;
            if (currentSection === this.section && this.section != null) {
                this.selected = true;
                this.section.open =
                    this.section.subSections && this.section.subSections.length && this.section.subSections.length > 0;
            } else {
                this.selected = false;
            }
        });
    }

    mouseEnter = () => (this.mouseover = true);

    mouseLeave = () => (this.mouseover = false);

    ngOnChanges(changes: SimpleChanges) {
        if (this.section) {
            this.subSections = this.section.subSections;
            this.isParent =
                this.section.subSections && this.section.subSections.length && this.section.subSections.length > 0;
        }
    }

    openClicked = () => (this.section.open = !this.section.open);

    select = () => this.sectionsService.selectSection(this.section.setParent(this.parent, this.level));

    addClicked(parent: Section, level: number) {
        this.level = level;
        this.sectionsService.addSection(new Section({}).setParent(parent, this.level + 1));
    }
}
