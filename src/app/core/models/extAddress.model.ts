export class ExtAddress {
    id: string;
    addressID: string;
    country: string;
    postCode: string;
    postBox: string;
    addressAreaName: string;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.addressID = obj.addressID;
        this.country = obj.country;
        this.postCode = obj.postCode;
        this.postBox = obj.postBox;
        this.addressAreaName = obj.addressAreaName;
    }
}
