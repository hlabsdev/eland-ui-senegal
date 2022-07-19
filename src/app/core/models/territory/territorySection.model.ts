import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';

export class TerritorySection implements Selectable {
    static COUNTRY = new TerritorySection('COUNTRY');
    static REGION = new TerritorySection('REGION');
    static CIRCLE = new TerritorySection('CIRCLE');
    static DIVISION = new TerritorySection('DIVISION');
    static DISTRICT = new TerritorySection('DISTRICT');
    value: TerritorySectionModel;

    static getAllSelectables(): SelectItem[] {
        return [
            TerritorySection.COUNTRY.toSelectItem(),
            TerritorySection.REGION.toSelectItem(),
            TerritorySection.CIRCLE.toSelectItem(),
            TerritorySection.DIVISION.toSelectItem(),
            TerritorySection.DISTRICT.toSelectItem(),
        ];
    }
    constructor(section: TerritorySectionModel) {
        this.value = section;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.value,
            value: this,
        };
    }

    toString(): string {
        return this.value;
    }
}

export type TerritorySectionModel = 'COUNTRY' | 'REGION' | 'CIRCLE' | 'DIVISION' | 'DISTRICT';
