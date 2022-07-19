export class Variables {
    [key: string]: VariableValue;

    constructor(obj: any = {}) {
        Object.assign(this, obj);
    }
}

export class VariableValue {
    value: any;
    type?: string;
    valueInfo?: any;

    constructor(obj: any = {}) {
        this.value = obj.value;
        this.type = obj.type;
        this.valueInfo = obj.valueInfo;
    }
}
