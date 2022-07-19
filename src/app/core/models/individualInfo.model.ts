export class IndividualInfo {
    firstName: string;
    lastName: string;
    emailAddress: string;
    birthDate: string;
    birthPlace: string;
    nationality: string;
    sex: string;
    civility: string;
    motherFirstName: string;
    motherLastName: string;
    fatherLastName: string;
    doorNo: string;
    region: string;
    country: string;
    streetName: string;
    city: string;
    mobilePhone: string;
    homePhone: string;
    occupation: string;
    activitySector: string;

    constructor(obj: any = {}) {
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
        this.emailAddress = obj.emailAddress;
        this.firstName = obj.firstName;
        this.lastName = obj.lastName;
        this.emailAddress = obj.emailAddress;
        this.birthDate = obj.birthDate;
        this.birthPlace = obj.birthPlace;
        this.nationality = obj.nationality;
        this.sex = obj.sex;
        this.civility = obj.civility;
        this.motherFirstName = obj.motherFirstName;
        this.motherLastName = obj.motherLastName;
        this.fatherLastName = obj.fatherLastName;
        this.doorNo = obj.doorNo;
        this.region = obj.region;
        this.country = obj.country;
        this.streetName = obj.streetName;
        this.city = obj.city;
        this.mobilePhone = obj.mobilePhone;
        this.homePhone = obj.homePhone;
        this.occupation = obj.occupation;
        this.activitySector = obj.activitySector;
    }
}
