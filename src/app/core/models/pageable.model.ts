import * as _ from 'lodash';

export class Pageable {
    sort: any;
    page: number;
    size: number;
    offset: number;
    pageSize: number;
    pageNumber: number;
    unpaged: boolean;
    paged: boolean;

    constructor(obj: any = {}) {
        this.sort = obj.sort;
        this.page = obj.page;
        this.size = obj.size;
        this.offset = obj.offset;
        this.pageSize = obj.pageSize;
        this.pageNumber = obj.pageNumber;
        this.unpaged = obj.unpaged;
        this.paged = obj.paged;
    }
}
