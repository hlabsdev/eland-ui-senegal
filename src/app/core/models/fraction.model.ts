export class Fraction {
    id: string;
    numeratorObj: any;
    denominatorObj: any;
    numerator: number;
    denominator: number;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.numeratorObj = obj.numerator;
        this.denominatorObj = obj.denominator;
        this.numerator = obj.numerator ? obj.numerator : 1;
        this.denominator = obj.denominator ? obj.denominator : 1;
    }

    getValidationError(): string {
        if (!this.numeratorObj || !this.denominatorObj) {
            return 'MESSAGES.REQUIRED';
        }

        if (Number(this.numerator) === 0 || Number(this.denominator) === 0) {
            return 'MESSAGES.ZERO_NOT_ALLOWED';
        }

        if (Number(this.numerator) > Number(this.denominator)) {
            return 'FRACTION.NUMERATOR_GREATER_DENOMINATOR';
        }

        return '';
    }

    format() {
        if (Number(this.numerator) === Number(this.denominator)) {
            this.numerator = Number(1);
            this.denominator = Number(1);
        }

        return new Fraction({
            id: this.id,
            numerator: this.numerator,
            denominator: this.denominator,
        });
    }
}
