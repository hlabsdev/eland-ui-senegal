import { Party } from './party.model';
import { PartyValidationResult } from './partyValidationResult.model';
import { ModelFactory } from '@app/core/utils/model.factory';

export class RoleChange {
    party: Party;
    associatedRightType: string;
    startRole: string;
    finalRole: string;
    finalRoleRightAware: string;
    validationResults: PartyValidationResult[];

    constructor(obj: any = {}) {
        Object.assign(this, obj);
        this.party = obj.party ? ModelFactory.managePartyPolymorphism(obj.party) : null;
        this.validationResults = obj.validationResults
            ? obj.validationResults.map((result) => new PartyValidationResult(result))
            : [];
    }
}
