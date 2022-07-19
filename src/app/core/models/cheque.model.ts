import { Source } from './source.model';
export class Cheque extends Source {
    chequeNumber: string;
    amount: number;
    institution: string;
    cardholder: string;
    constructor(obj: any = {}) {
        super(obj);
        this.chequeNumber = obj.chequeNumber;
        this.amount = obj.amount;
        this.institution = obj.institution;
        this.cardholder = obj.cardholder;
    }
}
