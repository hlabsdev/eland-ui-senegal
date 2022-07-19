import Utils from '../utils/utils';

export class LegalRepresentative {
    id: string;
    name: string;
    tin: string;
    phone: string;
    repReasonCode: string;
    repTypeCode: any;
    startDate: Date;
    endDate: Date;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.tin = obj.tin;
        this.phone = obj.phone;
        this.repReasonCode = obj.repReasonCode;
        this.repTypeCode = obj.repTypeCode;
        this.startDate = Utils.setDate(obj.startDate);
        this.endDate = Utils.setDate(obj.endDate);
    }
}
