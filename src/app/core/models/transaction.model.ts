import { Variables } from './variables.model';
import { Selectable } from '../interfaces/selectable.interface';
import { SelectItem } from 'primeng/api';
import { RRRValidation } from '@app/admin/rrr-validation/model/rrr-validation.model';
import { RRRValidationTransaction } from '@app/admin/rrr-validation/model/rrr-validation-transaction.model';

export class Transaction implements Selectable {
    id: string;
    name: string;
    processKey: string;
    workflowProcessId: string;
    initialContext: string;
    rrrValidationTransactions: RRRValidationTransaction[];
    private _initialContextObject: any;

    get initialContextObject(): any {
        return this.initialContext ? JSON.parse(this.initialContext) : {};
    }

    set initialContextObject(initialContext: any) {
        this.initialContext = initialContext ? JSON.stringify(initialContext) : '{}';
    }

    initialString: string;
    role: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.processKey = obj.processKey;
        this.workflowProcessId = obj.workflowProcessId;
        this.initialContext = obj.initialContext;
        this.role = obj.role ? obj.role : this.getTransactionRoles()[0];
        this.rrrValidationTransactions = obj.rrrValidationTransactions
            ? obj.rrrValidationTransactions.map(
                  (rrrValidationTransaction) => new RRRValidationTransaction(rrrValidationTransaction),
              )
            : [];
    }

    toSelectItem(): SelectItem {
        return {
            label: this.name,
            value: this,
        };
    }

    getTransactionRoles(): string[] {
        return ['SYSTEM_ADMINISTRATOR', 'MANUALLY_START_TRANSACTION'];
    }

    getPartyRolesValuesByRRRType(filterByRRRType: string): string[] {
        const result: string[] = [];
        this.rrrValidationTransactions
            .filter((item) => item.rrrValidation.type.value === filterByRRRType)
            .forEach((item) => item.rrrValidation.partyRoles.forEach((val) => result.push(val.role.value)));
        return result;
    }
}
