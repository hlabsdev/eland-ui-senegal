import * as _ from 'lodash';
import { Fraction } from './fraction.model';
import { VersionedObject } from './versionedObject.model';
import { Serializable } from '@app/core/interfaces/serializable.interface';
import { Variables } from '@app/core/models/variables.model';

export class PartyMember extends VersionedObject implements Serializable {
    pid: string;
    partyVersion: number;
    groupId: string;
    groupVersion: number;
    party: any;
    share: Fraction;
    id: string;

    constructor(obj: any = {}) {
        super(obj);
        this.pid = obj.pid;
        this.partyVersion = obj.version;
        this.groupId = obj.groupId;
        this.groupVersion = obj.groupVersion;
        this.party = obj.party;
        this.share = obj.share ? obj.share : new Fraction();
    }

    public serialize(): Variables {
        return {
            party: {
                value: JSON.stringify(this),
                type: 'Json',
            },
        };
    }

    public serializeWithoutId(): Variables {
        return {
            party: {
                value: JSON.stringify(_.set(_.cloneDeep(this), 'pid', null)),
                type: 'Json',
            },
        };
    }
}
