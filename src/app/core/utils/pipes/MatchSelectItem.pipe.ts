import { Pipe, PipeTransform } from '@angular/core';
import { SelectItem } from 'primeng/api';

@Pipe({ name: 'matchSelectItem' })
export class MatchSelectItemPipe implements PipeTransform {
    transform(id: string, items?: SelectItem[]): string {
        let tmp: string = id;
        for (const item of items) {
            if (item.value === id) {
                tmp = item.label;
            }
        }
        return tmp;
    }
}
