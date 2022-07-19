import { RRRValidationPartyRole } from './rrr-validation-party-role.model';
import { BlockerRRR } from './blocker-rrr.model';
import { RestrictionType } from '../../../workstation/rrr/restrictionType/restrictionType.model';
import { ResponsibilityType } from '../../../workstation/rrr/responsibilityType/responsibilityType.model';
import { CodeList } from '../../../core/models/codeList.model';
import { RRRValidationTransaction } from './rrr-validation-transaction.model';
import { isBoolean } from 'lodash';

export class RRRValidation {
    id: string;
    label: string;
    rrrType: string;
    rightType: string;
    type: CodeList;
    mortgageType: CodeList;
    requiresParty: boolean;
    partyRoles?: RRRValidationPartyRole[];
    blockerRRRs?: BlockerRRR[];
    rrrValidationTransactions?: RRRValidationTransaction[];

    restrictionType: RestrictionType;
    responsibilityType: ResponsibilityType;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.label = obj.label || '';
        this.rrrType = obj.rrrType;
        this.rightType = obj.rightType;
        this.type = obj.type ? new CodeList(obj.type) : null;
        this.mortgageType = obj.mortgageType ? new CodeList(obj.mortgageType) : null;
        this.requiresParty = isBoolean(obj.requiresParty) ? obj.requiresParty : false;
        this.partyRoles = obj.partyRoles || [];
        this.blockerRRRs = obj.blockerRRRs || [];
        this.rrrValidationTransactions = obj.rrrValidationTransactions
            ? obj.rrrValidationTransactions.map(
                  (rrrValidationTransaction) => new RRRValidationTransaction(rrrValidationTransaction),
              )
            : [];

        this.restrictionType = obj.restrictionType;
        this.responsibilityType = obj.responsibilityType;
    }
}
