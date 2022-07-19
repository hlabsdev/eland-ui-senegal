export class BlockerRRR {
    blockerRRRValidationId: string;
    requireConfirmation: boolean;

    id: string;

    constructor(obj: any = {}) {
        this.blockerRRRValidationId = obj.blockerRRRValidationId;
        this.requireConfirmation = obj.requireConfirmation ? obj.requireConfirmation : false;

        this.id = obj.id;
    }
}
