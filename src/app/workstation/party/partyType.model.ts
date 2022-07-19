import { SelectItem } from 'primeng/api';

export class PartyType {
    value: PartyTypeEnum;

    constructor(value: PartyTypeEnum) {
        this.value = value;
    }

    getSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this,
        };
    }
}

export type PartyTypeEnum = 'PARTY_BA_UNIT' | 'PARTY_GROUP' | 'PARTY_NATURAL_PERSON' | 'PARTY_NON_NATURAL_PERSON';

export const PartyTypes = {
    BA_UNIT: 'PARTY_BA_UNIT' as PartyTypeEnum,
    PARTY_GROUP: 'PARTY_GROUP' as PartyTypeEnum,
    PARTY_NATURAL_PERSON: 'PARTY_NATURAL_PERSON' as PartyTypeEnum,
    PARTY_LEGAL_PERSON: 'PARTY_NON_NATURAL_PERSON' as PartyTypeEnum,
};
