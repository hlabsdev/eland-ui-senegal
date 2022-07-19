import Utils from '../utils/utils';

export abstract class VersionedObject {
    beginLifespanVersion: Date;
    endLifespanVersion: Date;
    registered: boolean;
    registrationDate: Date;

    constructor(obj: any = {}) {
        this.beginLifespanVersion = Utils.setDate(obj.beginLifespanVersion);
        this.endLifespanVersion = Utils.setDate(obj.endLifespanVersion);
        this.registered = obj.registered ? obj.registered : false;
        this.registrationDate = Utils.setDate(obj.registrationDate);
    }

    isRegistered() {
        return this.registered;
    }
}
