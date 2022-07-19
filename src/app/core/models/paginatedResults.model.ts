import * as _ from 'lodash';
import { Pageable } from './pageable.model';

export class PaginatedResults {
    content: any[];
    pageable: Pageable;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    numberOfElements: number;
    first: boolean;
    last: boolean;
    empty: boolean;

    constructor(obj: any = {}) {
        this.content = obj.content;
        this.pageable = obj.pageable ? new Pageable(obj.pageable) : obj.pageable;
        this.totalPages = obj.totalPages;
        this.totalElements = obj.totalElements;
        this.size = obj.size;
        this.number = obj.number;
        this.numberOfElements = obj.numberOfElements;
        this.first = obj.first;
        this.last = obj.last;
        this.empty = obj.empty;
    }
}
