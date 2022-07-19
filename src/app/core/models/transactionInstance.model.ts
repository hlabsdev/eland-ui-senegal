import { Transaction } from './transaction.model';
import { Variables } from '@app/core/models/variables.model';
import Utils from '../utils/utils';

export class TransactionInstance {
    id: string;
    transaction: Transaction;
    workflowProcessInstanceId: string;
    context: Variables;
    transactionId: string;
    created: Date;
    updated: Date;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.transaction = obj.transaction || new Transaction(obj.transaction);
        this.workflowProcessInstanceId = obj.workflowProcessInstanceId;
        this.context = obj.context;
        this.transactionId = obj.transactionId;
        this.created = Utils.setDate(obj.created);
        this.updated = Utils.setDate(obj.updated);
    }
}
