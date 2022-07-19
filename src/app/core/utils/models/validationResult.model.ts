export class ValidationResult {
    isValid: boolean;
    message: string;

    constructor(valid: boolean, message = null) {
        this.isValid = valid;
        this.message = message;
    }
}
