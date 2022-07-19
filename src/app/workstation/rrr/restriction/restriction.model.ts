import { RRR } from '../rrr/rrr.model';
import { CodeList } from '@app/core/models/codeList.model';
import { RestrictionType } from '../restrictionType/restrictionType.model';

export class Restriction extends RRR {
    partyRequired: boolean;
    type: CodeList;
    restrictionType: RestrictionType;
    mortgageRecord: string;

    constructor(obj: any = {}) {
        super(obj);
        this.partyRequired = obj.partyRequired;
        this.type = obj.type;
        this.restrictionType = obj.restrictionType;
        this.mortgageRecord = obj.mortgageRecord;
    }

    isCaveat(): boolean {
        return (
            this.type &&
            (this.type.value === 'RESTRICTION_TYPE_COMPULSORY_EXPROPRIATION' ||
                this.type.value === 'RESTRICTION_TYPE_COMMAND_FOR_SEIZURE_OF_REAL_STATE')
        );
    }
}
