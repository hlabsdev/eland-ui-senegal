import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'match' })
export class MatchPipe implements PipeTransform {
    transform(id: string, collection?: any[], field?: string): string {
        let tmp: string = id;
        for (const item of collection) {
            if (item.id === id) {
                tmp = item[field ? field : 'name'];
            }
        }
        return tmp;
    }
}
