import { SelectItem } from 'primeng/api';
import { Serializable } from '@app/core/interfaces/serializable.interface';
import { Variables } from './variables.model';
import { VersionedObject } from './versionedObject.model';
import { CodeList } from './codeList.model';
import { ExtAddress } from './extAddress.model';
import { IParty } from './party.interface';
import { LegalRepresentative } from './legalRepresentative.model';
import { cloneDeep, set } from 'lodash';
import Utils from '../utils/utils';

export class Party extends VersionedObject implements Serializable, IParty {
    [x: string]: any;
    pid: string;
    version: number;
    electronicAddress: string;
    label: string;
    partyType: CodeList;
    partyRoleType: any;
    // rrr: string;
    extPID: string;
    address: ExtAddress;
    nif: string;
    legalRepresentative: LegalRepresentative;
    inscriptionDate: Date;
    radiationDate: Date;
    modDate: Date;
    modUser: string;
    registrationDate: Date;
    registered: boolean;

    constructor(obj: any = {}) {
        super(obj);
        this.pid = obj.pid;
        this.version = obj.version;
        this.electronicAddress = obj.electronicAddress;
        this.partyType = obj.partyType;
        this.label = obj.label;
        this.partyRoleType = obj.partyRoleType;
        // this.rrr = obj.rrr;
        this.extPID = obj.extPID;
        this.address = obj.address ? new ExtAddress(obj.address) : null;
        this.nif = obj.nif;
        this.legalRepresentative = obj.legalRepresentative
            ? new LegalRepresentative(obj.legalRepresentative)
            : new LegalRepresentative();
        this.inscriptionDate = Utils.setDate(obj.inscriptionDate);
        this.radiationDate = Utils.setDate(obj.radiationDate);
        this.modDate = Utils.setDate(obj.modDate);
        this.modUser = obj.modUser;
        this.registrationDate = Utils.setDate(obj.registrationDate);
        this.registered = obj.registered ? obj.registered : false;
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
                value: JSON.stringify(set(cloneDeep(this), 'pid', null)),
                type: 'Json',
            },
        };
    }

    getName(): string {
        return;
    }

    public isAllowed(roles: string[]): boolean {
        if (roles) {
            return roles.some((item) => this.partyRoleType.value === item);
        } else {
            return false;
        }
    }
}
