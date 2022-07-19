import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Section } from '@app/core/models/section.model';

@Component({
    selector: 'app-translation-section-elements',
    templateUrl: './sectionElements.component.html',
})
export class SectionElementsComponent {
    @Input() items: Section[];
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() select: EventEmitter<Section> = new EventEmitter<Section>();
    @Output() edit: EventEmitter<Section> = new EventEmitter<Section>();

    onSelect = (item: Section) => this.select.emit(item);

    onEdit = (item: Section) => this.edit.emit(item);
}
