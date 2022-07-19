import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';

export class EnterpriseInfo {
    registeredName: string;
    enterpriseType: string;
    streetName: string;
    responsibleOffice: ResponsibleOffice;
    startDate: string;
    closeDate: string;
    doorNo: string;
    city: string;
    country: string;
    locality: string;
    phoneNumber: string;

    constructor(obj: any = {}) {
        this.registeredName = obj.registredName;
        this.enterpriseType = obj.enterpriseType;
        this.streetName = obj.streetName;
        this.responsibleOffice = obj.responsibleOffice ? new ResponsibleOffice(obj.responsibleOffice) : null;
        this.startDate = obj.startDate;
        this.closeDate = obj.closeDate;
        this.doorNo = obj.doorNo;
        this.city = obj.city;
        this.country = obj.country;
        this.locality = obj.locality;
        this.phoneNumber = obj.phoneNumber;
    }
}
