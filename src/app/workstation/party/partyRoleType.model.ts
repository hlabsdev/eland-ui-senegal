import { SelectItem } from 'primeng/api';

export class PartyRoleType {
    value: PartyRoleTypeEnum;

    constructor(value: PartyRoleTypeEnum) {
        this.value = value;
    }

    getSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this.value,
        };
    }
}

export type PartyRoleTypeEnum = 'BANK' | 'CERTIFIED_SURVEYOR' | 'CITIZEN';

export const PartyRoleTypes = {
    BANK: 'BANK' as PartyRoleTypeEnum,
    CERTIFIED_SURVEYOR: 'CERTIFIED_SURVEYOR' as PartyRoleTypeEnum,
    CITIZEN: 'CITIZEN' as PartyRoleTypeEnum,
};
