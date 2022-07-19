import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Section } from '@app/core/models/section.model';
import { replaceSpaceAndAutoMaj } from '@app/admin/parameters/translation/sectionItem/utils';

@Component({
    selector: 'app-translation-section-modal',
    templateUrl: './section.modal.component.html',
})
export class SectionModalComponent {
    @Input() visible = false;
    @Input() section: Section;
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onHide: EventEmitter<any> = new EventEmitter<any>();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onSave: EventEmitter<Section> = new EventEmitter<Section>();
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    @Output() onCancel: EventEmitter<any> = new EventEmitter<any>();

    errors: any;

    hide = () => this.onHide.emit(null);
    save = () => this.onSave.emit(this.section);
    cancel = () => this.onCancel.emit(null);

    replaceSpaceAndAutoMaj() {
        this.section.name = replaceSpaceAndAutoMaj(this.section.name);
    }
}
