import { SelectItem } from 'primeng/api';

export class ApplicantType {
    value: ApplicantTypeEnum;

    constructor(value: ApplicantTypeEnum) {
        this.value = value;
    }

    getSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this,
        };
    }
}

export type ApplicantTypeEnum = 'APPLICANT_NATURAL_PERSON' | 'APPLICANT_NON_NATURAL_PERSON';

export const ApplicantTypes = {
    APPLICANT_NATURAL_PERSON: 'APPLICANT_NATURAL_PERSON' as ApplicantTypeEnum,
    APPLICANT_LEGAL_PERSON: 'APPLICANT_NON_NATURAL_PERSON' as ApplicantTypeEnum,
};
