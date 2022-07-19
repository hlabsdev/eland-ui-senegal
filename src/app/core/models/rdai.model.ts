import { Registry } from '@app/core/models/registry.model';
import { Region } from '@app/core/models/territory/region.model';
import Utils from '../utils/utils';
import { Act } from './act.model';
import { TransactionInstance } from './transactionInstance.model';

export class Rdai {
    id: string;
    act: Act;
    designation: string;
    depositQuantity: number;
    depositDate: Date;
    depositNumber: number;
    depositVolume: number;
    depositFolio: number;
    observation: string;
    registry: Registry;
    region: Region;
    baUnitId: string;
    baUnitVersion: number;
    baUnitTitleNumber: string;
    baUnitSpatialUnitRegion: string;
    baUnitSeller: string;
    baUnitBuyer: string;
    baUnitResponsibleOffice: string;
    transactionInstance: TransactionInstance;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.act = obj.act ? new Act(obj.act) : null;
        this.designation = obj.designation;
        this.depositQuantity = obj.depositQuantity;
        this.depositDate = Utils.setDate(obj.depositDate);
        this.depositNumber = obj.depositNumber;
        this.depositVolume = obj.depositVolume;
        this.depositFolio = obj.depositFolio;
        this.observation = obj.observation;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.region = obj.region ? new Region(obj.region) : null;
        this.baUnitTitleNumber = obj.baUnitTitleNumber ? obj.baUnitTitleNumber : null;
        this.baUnitSpatialUnitRegion = obj.baUnitSpatialUnitRegion ? obj.baUnitSpatialUnitRegion : null;
        this.baUnitSeller = obj.baUnitSeller;
        this.baUnitBuyer = obj.baUnitBuyer;
        this.baUnitResponsibleOffice = obj.baUnitResponsibleOffice ? obj.baUnitResponsibleOffice : null;
        this.transactionInstance = obj.transactionInstance ? obj.transactionInstance : null;
    }
}
