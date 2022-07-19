import { Registry } from './registry.model';
import * as _ from 'lodash';

export class RegistryRecord {
    id: string;
    titleId: string;
    registry: Registry;
    volume: number;
    folio: number;
    hasOldRegistry: boolean;
    oldTitleId: string;
    oldDistrict: string;
    oldVolume: number;
    oldFolio: number;
    oldRegistry: Registry;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.titleId = obj.titleId;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.volume = obj.volume;
        this.folio = obj.folio;
        this.hasOldRegistry = obj.hasOldRegistry ? obj.hasOldRegistry : false;
        this.oldTitleId = obj.oldTitleId;
        this.oldDistrict = obj.oldDistrict;
        this.oldVolume = obj.oldVolume;
        this.oldFolio = obj.oldFolio;
        this.oldRegistry = obj.oldRegistry;
    }

    cloneWithOldPreset(): RegistryRecord {
        const newRegistryRecord = _.clone(this);
        newRegistryRecord.id = null;
        newRegistryRecord.titleId = null;
        newRegistryRecord.oldTitleId = this.titleId;
        newRegistryRecord.oldRegistry = this.registry;
        newRegistryRecord.volume = null;
        newRegistryRecord.oldVolume = this.volume;
        newRegistryRecord.folio = null;
        newRegistryRecord.oldFolio = this.folio;
        return newRegistryRecord;
    }

    setNewPreset(newPreset: Partial<RegistryRecord>): RegistryRecord {
        this.id = newPreset.id;
        this.titleId = newPreset.titleId;
        this.volume = newPreset.volume;
        this.folio = newPreset.folio;
        return this;
    }
}
