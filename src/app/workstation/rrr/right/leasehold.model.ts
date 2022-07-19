import { Right } from './right.model';

export class Leasehold extends Right {
    condition: string;
    termYears: number;
    preamble: string;
    contractTerms: string;
    contractualObject: string;
    investmentAmount: number;
    contractPeriodYears: number;
    contractPeriodMonths: number;
    developmentDeadlineYears: number;
    developmentDeadlineMonths: number;
    annualFee: number;
    m2Fee: number;

    constructor(obj: any = {}) {
        super(obj);
        this.condition = obj.condition;
        this.termYears = obj.termYears;
        this.preamble = obj.preamble;
        this.contractTerms = obj.contractTerms;
        this.contractualObject = obj.contractualObject;
        this.investmentAmount = obj.investmentAmount;
        this.contractPeriodYears = obj.contractPeriodYears;
        this.contractPeriodMonths = obj.contractPeriodMonths;
        this.developmentDeadlineYears = obj.developmentDeadlineYears;
        this.developmentDeadlineMonths = obj.developmentDeadlineMonths;
        this.annualFee = obj.annualFee;
        this.m2Fee = obj.m2Fee;
    }
}
