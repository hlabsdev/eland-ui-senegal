import { RRRValidation } from './rrr-validation.model';
import { Transaction } from '../../../core/models/transaction.model';

export class RRRValidationTransaction {
    rrrValidationId: string;
    rrrValidation: RRRValidation;
    transactionId: string;
    transaction: Transaction;
    requiredRRR: boolean;

    constructor(obj: any = {}) {
        this.rrrValidationId = obj.rrrValidationId;
        this.rrrValidation = obj.rrrValidation;
        this.transactionId = obj.transactionId;
        this.transaction = obj.transaction;
        this.requiredRRR = obj.requiredRRR;
    }
}
