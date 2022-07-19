import Utils from '../utils/utils';
import { Act } from './act.model';
import { DivisionRegistry } from './divisionRegistry.model';

export class OppositionRegistry {
    id: string;
    entryNumber: number;
    depositDate: Date;
    depositVolume: number;
    depositNumber: number;
    depositFolio: number;
    observation: string;
    releaseNotice: string;
    act: Act;
    baUnitId: string;
    baUnitVersion: number;
    baUnitSeller: string;
    baUnitBuyer: string;
    divisionRegistry: DivisionRegistry;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.act = obj.act ? new Act(obj.act) : null;
        this.entryNumber = obj.entryNumber;
        this.depositDate = Utils.setDate(obj.depositDate);
        this.depositVolume = obj.depositVolume;
        this.depositNumber = obj.depositNumber;
        this.depositFolio = obj.depositFolio;
        this.observation = obj.observation;
        this.releaseNotice = obj.releaseNotice;
        this.divisionRegistry = obj.divisionRegistry ? new DivisionRegistry(obj.divisionRegistry) : null;
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.baUnitSeller = obj.baUnitSeller;
        this.baUnitBuyer = obj.baUnitBuyer;
    }
}
