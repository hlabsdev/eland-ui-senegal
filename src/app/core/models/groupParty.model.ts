import { SelectItem } from 'primeng/api';
import * as _ from 'lodash';
import { Serializable } from '@app/core/interfaces/serializable.interface';
import { Variables } from '@app/core/models/variables.model';
import { PartyMember } from './partyMember.model';
import { VersionedObject } from './versionedObject.model';

export class GroupParty extends VersionedObject implements Serializable {
    [x: string]: any;
    groupPartyID: string;
    version: number;
    type: string;
    partyMembers: PartyMember[];

    constructor(obj: any = {}) {
        super(obj);
        this.groupPartyID = obj.groupPartyID;
        this.version = obj.version;
        this.type = obj.type;
        this.partyMembers = obj.partyMembers ? obj.partyMembers.map((p) => new PartyMember(p)) : [];
    }

    public getSelectItem(): SelectItem {
        return { label: this.value, value: this };
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
