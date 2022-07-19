import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { SelectItem } from 'primeng/api';
import { Language } from '@app/core/models/language.model';

@Component({
    selector: 'app-params-language-dialog',
    templateUrl: './languageDialog.component.html',
})
export class LanguageDialogComponent {
    @Input() errors: any;
    @Input() item: Language;
    @Input() title: string;
    @Input() locales: SelectItem[];
    form: any;
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();
    @Output() canceled = new EventEmitter();

    cancel = () => this.canceled.emit();

    save = () => this.saved.emit(this.item);
}
