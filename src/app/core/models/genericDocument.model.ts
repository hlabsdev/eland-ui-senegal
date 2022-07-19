import * as _ from 'lodash';
import { Serializable } from '@app/core/interfaces/serializable.interface';
import { Variables } from '@app/core/models/variables.model';

export class GenericDocument implements Serializable {
    body: string;

    constructor(obj: any = {}) {
        this.body = obj.body ? obj.body : '';
    }

    public serialize(): Variables {
        return {
            document: {
                value: JSON.stringify(this),
                type: 'Json',
            },
        };
    }

    public serializeWithoutId(): Variables {
        return {
            avisDeBornage: {
                value: JSON.stringify(this),
                type: 'Json',
            },
        };
    }
}
