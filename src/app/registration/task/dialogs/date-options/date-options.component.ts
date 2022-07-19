import { Component, Input, OnInit } from '@angular/core';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { DialogOptions } from '@app/registration/task/dialogs/multi-dialogs/dialog-options.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-date-options',
    templateUrl: './date-options.component.html',
})
export class DateOptionsComponent implements OnInit {
    errorMessage: string;
    @Input() dialogOptions: DialogOptions;
    locale: any;
    dateValueStart: Date;
    dateValueEnd: Date;
    disableFutureYears: string;
    disablePastDates: Date;

    /** todo: add multi-date support : add range date support
      todo: filter to add :: second date lower than first one; date not in futur / past; optional? */

    constructor(protected translateService: TranslateService) {}

    ngOnInit() {
        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
        this.disableFutureYears = '1900:2999';
        this.disablePastDates = new Date();
    }
}
