import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'len' })
export class LenPipe implements PipeTransform {
    transform(text: string, length = 15): string {
        return text.length > length ? text.substring(0, length - 3) + '...' : text;
    }
}
