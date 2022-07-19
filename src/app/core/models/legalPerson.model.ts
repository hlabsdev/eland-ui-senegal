import { Party } from './party.model';
import { ResponsibleParty } from './responsibleParty.model';
import { InternationalAddress } from './internationalAddress.model';
import { IParty } from './party.interface';
import Utils from '../utils/utils';

export class LegalPerson extends Party implements IParty {
    name: string;
    establishmentDate: Date;
    legalPersonType: any;
    contactPerson: ResponsibleParty;
    terminationDate: Date;
    internationalAddress: InternationalAddress;
    commerceCreditRegistryNumber: string;

    constructor(obj: any = {}) {
        super(obj);
        this.name = obj.name;
        this.establishmentDate = Utils.setDate(obj.establishmentDate);
        this.legalPersonType = obj.legalPersonType;
        this.contactPerson = obj.contactPerson ? new ResponsibleParty(obj.contactPerson) : new ResponsibleParty();
        this.terminationDate = Utils.setDate(obj.terminationDate);
        this.internationalAddress = obj.internationalAddress
            ? new InternationalAddress(obj.internationalAddress)
            : new InternationalAddress();
        this.commerceCreditRegistryNumber = obj.commerceCreditRegistryNumber;
    }

    getName(): string {
        return this.name;
    }
}
