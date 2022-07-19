import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { longDate } from './locale.constants';

@Pipe({
    name: 'localeDate',
    pure: false,
})
export class LocaleDatePipe implements PipeTransform {
    constructor(private translateService: TranslateService) {}
    transform(value: any, pattern = 'mediumDate'): any {
        const datePipe: DatePipe = new DatePipe(this.translateService.currentLang);
        pattern = pattern === 'longDate' ? longDate : pattern;
        return datePipe.transform(value, pattern);
    }
}
