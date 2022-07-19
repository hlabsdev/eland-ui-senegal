import { SelectItem } from 'primeng/api';
import { Registry } from '@app/core/models/registry.model';
import { Selectable } from '@app/core/interfaces/selectable.interface';

export class ResponsibleOffice implements Selectable {
    id: string;
    name: string;
    code: string;
    correspondingRole: string;
    taxCenterId: string;
    registries: Registry[];
    registryNames: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.code = obj.code;
        this.name = obj.name;
        this.correspondingRole = obj.correspondingRole;
        this.taxCenterId = obj.taxCenterId;
        this.registryNames = obj.registryNames;
        this.registries = obj.registries ? obj.registries.map((registry) => new Registry(registry)) : [];
    }

    toSelectItem(): SelectItem {
        return {
            label: `${this.name} (${this.code})`,
            value: this,
        };
    }
}
