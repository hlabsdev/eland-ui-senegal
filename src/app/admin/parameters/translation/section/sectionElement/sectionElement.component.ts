import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Section } from '@app/core/models/section.model';

@Component({
    selector: 'app-translation-section-element',
    templateUrl: './sectionElement.component.html',
    styleUrls: ['./sectionElement.component.scss'],
})
export class SectionElementComponent {
    @Input() item: Section;
    // eslint-disable-next-line @angular-eslint/no-output-native
    @Output() select: EventEmitter<Section> = new EventEmitter<Section>();
    @Output() edit: EventEmitter<Section> = new EventEmitter<Section>();

    ev = false;

    onSelect = () => this.select.emit(this.item);

    onEdit = () => this.edit.emit(this.item);

    editVisible() {
        this.ev = true;
        setTimeout(() => {
            this.ev = false;
        }, 1200);
    }
}
