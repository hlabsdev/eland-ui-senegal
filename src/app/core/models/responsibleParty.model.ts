import { ContactInfo } from './contactInfo.model';
export class ResponsibleParty {
    id: string;
    contactInfo: ContactInfo;
    individualName: string;
    organizationName: string;
    positionName: string;
    role: any;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.contactInfo = obj.contactInfo ? new ContactInfo(obj.contactInfo) : new ContactInfo();
        this.individualName = obj.individualName;
        this.organizationName = obj.organizationName;
        this.positionName = obj.positionName;
        this.role = obj.role;
    }
}
