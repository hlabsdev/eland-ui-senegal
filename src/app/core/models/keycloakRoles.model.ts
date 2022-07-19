import { SelectItem } from 'primeng/api';
import { Selectable } from '@app/core/interfaces/selectable.interface';

export class KeycloakRoles implements Selectable {
    id: string;
    name: string;
    description: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.name = obj.name;
        this.description = obj.description;
    }

    toSelectItem(): SelectItem {
        return {
            label: this.name,
            value: this.name,
        };
    }
}
