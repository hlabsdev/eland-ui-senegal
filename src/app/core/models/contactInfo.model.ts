export class ContactInfo {
    id: string;
    contactInstructions: string;
    hoursOfService: string;
    onlineResource: string;
    address: string;
    phone: string;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.address = obj.address;
        this.contactInstructions = obj.contactInstructions;
        this.hoursOfService = obj.hoursOfService;
        this.onlineResource = obj.hoursOfService;
        this.phone = obj.phone;
    }
}
