import { Party } from './party.model';
import { FullName } from './fullName.model';
import { InternationalAddress } from './internationalAddress.model';
import { TypeID } from './typeID.model';
import { IParty } from './party.interface';
import Utils from '../utils/utils';

export class NaturalPerson extends Party implements IParty {
    fullName: FullName;
    dateOfBirth: Date;
    dateOfDeath: Date;
    gender: any;
    maritalStatus: any;
    mobileNumber: string;
    nationality: any;
    socialDenomination: string;
    maidenName: string;
    civility: any;
    birthPlace: string;
    phoneNumber: string;
    fatherName: string;
    fatherFirstName: string;
    motherName: string;
    motherFirstName: string;
    primaryIdentityDocument: TypeID;
    secondaryIdentityDocument: TypeID;
    internationalAddress: InternationalAddress;
    occupation: string;
    nina: string;

    constructor(obj: any = {}) {
        super(obj);
        this.fullName = obj.fullName ? new FullName(obj.fullName) : null;
        this.dateOfBirth = Utils.setDate(obj.dateOfBirth);
        this.dateOfDeath = Utils.setDate(obj.dateOfDeath);
        this.gender = obj.gender;
        this.maritalStatus = obj.maritalStatus;
        this.mobileNumber = obj.mobileNumber;
        this.nationality = obj.nationality;
        this.socialDenomination = obj.socialDenomination ? obj.socialDenomination : '';
        this.maidenName = obj.maidenName;
        this.civility = obj.civility;
        this.birthPlace = obj.birthPlace;
        this.phoneNumber = obj.phoneNumber;
        this.fatherName = obj.fatherName;
        this.fatherFirstName = obj.fatherFirstName;
        this.motherName = obj.motherName;
        this.motherFirstName = obj.motherFirstName;
        this.primaryIdentityDocument = obj.primaryIdentityDocument
            ? new TypeID(obj.primaryIdentityDocument)
            : new TypeID();
        this.internationalAddress = obj.internationalAddress
            ? new InternationalAddress(obj.internationalAddress)
            : new InternationalAddress();
        this.occupation = obj.occupation;
        this.secondaryIdentityDocument = obj.secondaryIdentityDocument
            ? new TypeID(obj.secondaryIdentityDocument)
            : null;
        this.nina = obj.nina;
    }

    getName(): string {
        return this.fullName.fullName;
    }
}
