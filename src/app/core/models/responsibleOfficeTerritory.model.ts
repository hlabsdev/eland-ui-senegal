import { SelectItem } from 'primeng/api';

export class ResponsibleOfficeTerritory {
    static REGION = new ResponsibleOfficeTerritory('REGION');
    static DIVISION = new ResponsibleOfficeTerritory('DIVISION');
    static CIRCLE = new ResponsibleOfficeTerritory('CIRCLE');
    value: ResponsibleOfficeTerritoryEnum;

    constructor(value: ResponsibleOfficeTerritoryEnum) {
        this.value = value;
    }

    getSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this,
        };
    }
}

export type ResponsibleOfficeTerritoryEnum = 'REGION' | 'DIVISION' | 'CIRCLE';
