export class Group {
    id: string;
    name: string;
    type: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.type = obj.type;
    }
}
