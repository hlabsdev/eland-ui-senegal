import { Component, OnInit, SimpleChanges } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FieldConfig } from '@app/core/models/field.model';
import { getlocaleConstants } from '@app/core/utils/locale.constants';
import { TranslateService } from '@ngx-translate/core';

import * as _ from 'lodash';
@Component({
    selector: 'app-date',
    templateUrl: './date.component.html',
    styles: [],
})
export class DateComponent implements OnInit {
    field: FieldConfig;
    group: FormGroup;

    disableFutureDates: Date;
    disableFutureYears: string;
    locale: any;

    constructor(private translateService: TranslateService) {}

    ngOnInit() {
        const { localeSettings } = getlocaleConstants(this.translateService.currentLang);
        this.locale = localeSettings;
        this.disableFutureDates = _.get(this.field.properties, 'disableFutureDates') ? new Date() : null;
        this.disableFutureYears = _.get(this.field.properties, 'disableFutureDates')
            ? `1900:${new Date().getFullYear().toString()}`
            : '1900:2999"';
    }
}
