import { Selectable } from '@app/core/interfaces/selectable.interface';
import { Circle } from './circle.model';
import { Territory } from './territory.model';
import { Registry } from '@app/core/models/registry.model';

export class Division extends Territory implements Selectable {
    circleId: string;
    circleName:string;
    circle: Circle;
    registries: Registry[];
    registry:Registry;
    registryCode: string;
    registryId: string;

    constructor(obj: any = {}) {
        super(obj);
        this.circle = obj.circle ? new Circle(obj.circle) : null;
        this.circleId = obj.circle ? obj.circle.id : obj.circleId;
        this.circleName = obj.circle ? obj.circle.name : obj.circleName;
        this.registries = obj.registries ? obj.registries.map((registry) => new Registry(registry)) : [];
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.registryCode = obj.registry ? obj.registry.code : obj.registryCode;
        this.registryId = obj.registry ? obj.registry.id : obj.registryId;

    }
}
