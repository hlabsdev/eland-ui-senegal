import { Variables } from '@app/core/models/variables.model';

export interface Serializable {
    serialize(): Variables;
    serializeWithoutId(): Variables;
}
