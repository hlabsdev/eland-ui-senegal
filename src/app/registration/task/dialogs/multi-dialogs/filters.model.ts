export class Filters {
    type: string;
    values: string[];

    constructor(obj: Partial<Filters>) {
        this.type = obj.type;
        this.values = obj.values;
    }

    static fromString(str: string): Filters {
        const dDot = str.indexOf(':');
        const type = str.substring(0, dDot >= 0 ? dDot : null);
        const values = dDot >= 0 ? str.substring(dDot).split(',') : [];
        return new Filters({ type, values });
    }
}
