import { TransactionInstance } from './transactionInstance.model';
import { Act } from './act.model';
import { Registry } from './registry.model';
import Utils from '../utils/utils';

export class GeneralFormalityRegistry {
    id: string;
    entryNumber: number;
    depositDate: Date;
    depositVolume: number;
    depositFolio: number;
    depositNumber: number;
    observation: string;
    registry?: Registry;
    act: Act;
    registrationFees: number;
    baUnitId: string;
    baUnitVersion: number;
    baUnitTitleNumber: string;
    baUnitSpatialUnitRegion: string;
    transactionInstance: TransactionInstance;
    constructor(obj: any = {}) {
        this.id = obj.id;
        this.act = obj.act ? new Act(obj.act) : null;
        this.entryNumber = obj.entryNumber;
        this.depositDate = Utils.setDate(obj.depositDate);
        this.depositVolume = obj.depositVolume;
        this.depositFolio = obj.depositFolio;
        this.depositNumber = obj.depositNumber;
        this.observation = obj.observation;
        this.registrationFees = obj.registrationFees;
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.baUnitTitleNumber = obj.baUnitTitleNumber ? obj.baUnitTitleNumber : null;
        this.baUnitSpatialUnitRegion = obj.baUnitSpatialUnitRegion ? obj.baUnitSpatialUnitRegion : null;
        this.transactionInstance = obj.transactionInstance ? obj.transactionInstance : null;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
    }
}
