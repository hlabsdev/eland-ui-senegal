import { SelectItem } from 'primeng/api';
import { Selectable } from '../interfaces/selectable.interface';

export class CodeListType implements Selectable {
    value: CodeListTypeEnum;

    constructor(value: CodeListTypeEnum) {
        this.value = value;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type CodeListTypeEnum =
    | 'PARTY_TYPE'
    | 'PARTY_ROLE'
    | 'GROUP_PARTY_TYPE'
    | 'GENDER_TYPE'
    | 'COUNTRY_TYPE'
    | 'ADMINISTRATIVE_SOURCE_TYPE'
    | 'AVAILABILITY_STATUS_TYPE'
    | 'RIGHT_TYPE'
    | 'RESTRICTION_TYPE'
    | 'RESPONSIBILITY_TYPE'
    | 'BA_UNIT_TYPE'
    | 'PRESENTATION_FORM_CODE_TYPE'
    | 'LEGAL_PERSON_TYPE'
    | 'MARITAL_STATUS'
    | 'DOCUMENT_TEMPLATE_TYPE'
    | 'LEGAL_PERSON_TYPE'
    | 'PARCEL_NATURE_TYPE'
    | 'ACT_TYPE'
    | 'SIGNING_AUTHORITY_TYPE'
    | 'ACQUISITION_MODE_TYPE'
    | 'SURFACE_MEASUREMENT_UNIT';

export const CodeListTypes = {
    PARTY_TYPE: 'PARTY_TYPE' as CodeListTypeEnum,
    PARTY_ROLE: 'PARTY_ROLE' as CodeListTypeEnum,
    GROUP_PARTY_TYPE: 'GROUP_PARTY_TYPE' as CodeListTypeEnum,
    RIGHT_TYPE: 'RIGHT_TYPE' as CodeListTypeEnum,
    RESTRICTION_TYPE: 'RESTRICTION_TYPE' as CodeListTypeEnum,
    RESPONSIBILITY_TYPE: 'RESPONSIBILITY_TYPE' as CodeListTypeEnum,
    BA_UNIT_TYPE: 'BA_UNIT_TYPE' as CodeListTypeEnum,
    GENDER_TYPE: 'GENDER_TYPE' as CodeListTypeEnum,
    DOCUMENT_TEMPLATE_TYPE: 'DOCUMENT_TEMPLATE_TYPE' as CodeListTypeEnum,
    COUNTRY_TYPE: 'COUNTRY_TYPE' as CodeListTypeEnum,
    ADMINISTRATIVE_SOURCE_TYPE: 'ADMINISTRATIVE_SOURCE_TYPE' as CodeListTypeEnum,
    AVAILABILITY_STATUS_TYPE: 'AVAILABILITY_STATUS_TYPE' as CodeListTypeEnum,
    PRESENTATION_FORM_CODE_TYPE: 'PRESENTATION_FORM_CODE_TYPE' as CodeListTypeEnum,
    LEGAL_PERSON_TYPE: 'LEGAL_PERSON_TYPE' as CodeListTypeEnum,
    MARITAL_STATUS: 'MARITAL_STATUS' as CodeListTypeEnum,
    PARCEL_NATURE_TYPE: 'PARCEL_NATURE_TYPE' as CodeListTypeEnum,
    ACT_TYPE: 'ACT_TYPE' as CodeListTypeEnum,
    SIGNING_AUTHORITY_TYPE: 'SIGNING_AUTHORITY_TYPE' as CodeListTypeEnum,
    ACQUISITION_MODE_TYPE: 'ACQUISITION_MODE_TYPE' as CodeListTypeEnum,
    SURFACE_MEASUREMENT_UNIT: 'SURFACE_MEASUREMENT_UNIT' as CodeListTypeEnum,
    BA_UNIT_CREATION_MODE: 'BA_UNIT_CREATION_MODE' as CodeListTypeEnum,
};
