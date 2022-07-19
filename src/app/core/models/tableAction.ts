enum actionType {
    'start',
    'open',
    'view',
    'edit',
    'delete',
}

export class TableAction {
    type: any = actionType;
    callback: any;

    constructor(obj: any = {}) {
        this.type = obj.type;
        this.callback = obj.callback;
    }
}
