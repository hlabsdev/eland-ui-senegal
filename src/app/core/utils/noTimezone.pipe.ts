import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'noTimezone' })
export class NoTimezone implements PipeTransform {
    transform(value: Date) {
        if (value && value instanceof Date) {
            return new Date(
                value.getUTCFullYear(),
                value.getUTCMonth(),
                value.getUTCDate(),
                value.getUTCHours(),
                value.getUTCMinutes(),
                value.getUTCSeconds(),
            );
        }
        return value;
    }
}
