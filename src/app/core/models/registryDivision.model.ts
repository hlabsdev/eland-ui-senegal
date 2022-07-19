import { Division } from '@app/core/models/territory/division.model';
import { Registry } from '@app/core/models/registry.model';

export class RegistryDivision {
    id: string;
    registryId: string;
    divisionId: string;
    registry: Registry;
    division: Division;

    constructor(obj: any) {
        this.id = obj.id;
        this.registryId = obj.registryId;
        this.divisionId = obj.divisionId;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.division = obj.division ? new Division(obj.division) : null;
    }
}
