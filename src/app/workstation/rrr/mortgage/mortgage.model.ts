import { Restriction } from '../restriction/restriction.model';
import { Right } from '../right/right.model';

export class Mortgage extends Restriction {
    interestRate: number;
    ranking: number;
    right: Right;

    constructor(obj: any = {}) {
        super(obj);
        this.interestRate = obj.interestRate;
        this.ranking = obj.ranking;
        this.right = obj.right;
    }
}
