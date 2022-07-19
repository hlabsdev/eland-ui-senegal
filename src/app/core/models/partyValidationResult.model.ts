export class PartyValidationResult {
    ruleName: string;
    result: string;
    message: string;

    constructor(obj: any = {}) {
        Object.assign(this, obj);
    }
}
