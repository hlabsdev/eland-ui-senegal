export class InternationalAddress {
    id: string;
    country: any;
    region: string;
    city: string;
    village: string;
    streetNumber: string;
    doorNumber: string;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.country = obj.country;
        this.region = obj.region;
        this.city = obj.city;
        this.village = obj.village;
        this.streetNumber = obj.streetNumber;
        this.doorNumber = obj.doorNumber;
    }
}
