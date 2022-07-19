import { Right } from './right.model';

export class SubLease extends Right {
    condition: string;
    termYears: number;
    constructor(obj: any = {}) {
        super(obj);
        this.condition = obj.condition;
        this.termYears = obj.termYears;
    }
}
