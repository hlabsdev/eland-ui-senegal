enum colType {
    'text',
    'date',
}

export class TableCols {
    field: string;
    subField?: string;
    header: string;
    sortable?: boolean;
    filterable?: boolean;
    type?: any = colType;
    width?: string;

    constructor(obj: any = {}) {
        this.field = obj.field;
        this.subField = obj.subField;
        this.header = obj.header;
        this.sortable = obj.sortable;
        this.filterable = obj.filterable;
        this.type = obj.type ?? 'text';
        this.width = obj.width;
    }
}
