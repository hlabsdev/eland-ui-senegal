import { Pipe, PipeTransform } from '@angular/core';
import { ConfigService } from '../../core/app-config/config.service';
import * as moment from 'moment';

@Pipe({ name: 'specificTimezone' })
export class SpecificTimezone implements PipeTransform {
    constructor(protected configService: ConfigService) {}

    transform(value: Date) {
        if (value && value instanceof Date) {
            const defaultTimeZone =
                Number(this.configService.getDefaultConfig('EXTERNAL_SERVICES.defaultTimeZone')) || 0;
            const date = moment(value).utcOffset(defaultTimeZone);
            return new Date(date.year(), date.month(), date.date(), date.hours(), date.minutes(), date.seconds());
        }
        return value;
    }
}
