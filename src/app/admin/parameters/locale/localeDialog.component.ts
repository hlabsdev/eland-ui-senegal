import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SelectItem } from 'primeng/api';
import { ParametersService } from '../parameters.service';
import { Locale } from '@app/core/models/locale.model';

@Component({
    selector: 'app-params-locale-dialog',
    templateUrl: './localeDialog.component.html',
})
export class LocaleDialogComponent {
    @Input() errors: any;
    @Input() item: Locale;
    @Input() title: string;
    form: any;
    @Output() saved: EventEmitter<any> = new EventEmitter<any>();
    @Output() canceled = new EventEmitter();

    cancel = () => this.canceled.emit();

    save = () => this.saved.emit(this.item);
}
