import { Act } from './act.model';
import { TransactionInstance } from './transactionInstance.model';
import { Registry } from '@app/core/models/registry.model';
import { OppositionRegistry } from '@app/core/models/oppositionRegistry.model';
import { Applicant } from '@app/core/models/applicant.model';
import { Region } from '@app/core/models/territory/region.model';

export class DivisionRegistry {
    id?: string;
    act?: Act;
    area?: number;
    applicant?: Applicant;
    depositDate?: Date;
    price?: number;
    requisitionNumber: string;
    requisitionTransmitDate: Date;
    registry?: Registry;
    oppositionRegistry: OppositionRegistry[];
    entryNumber?: number;
    region?: Region;
    baUnitId?: string;
    baUnitVersion?: number;
    baUnitTitleNumber?: string;
    baUnitSpatialUnitRegion?: string;
    baUnitSeller?: string;
    baUnitBuyer?: string;
    transactionInstance?: TransactionInstance;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.act = obj.act ? obj.act : null;
        this.area = obj.area;
        this.applicant = obj.applicant ? new Applicant(obj.applicant) : new Applicant();
        this.depositDate = obj.depositDate;
        this.price = obj.price;
        this.entryNumber = obj.entryNumber;
        this.requisitionNumber = obj.requisitionNumber;
        this.requisitionTransmitDate = obj.requisitionTransmitDate;
        this.oppositionRegistry = obj.oppositionRegistry;
        this.registry = obj.registry ? new Registry(obj.registry) : null;
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.region = obj.region ? new Region(obj.region) : null;
        this.baUnitTitleNumber = obj.baUnitTitleNumber ? obj.baUnitTitleNumber : null;
        this.baUnitSpatialUnitRegion = obj.baUnitSpatialUnitRegion ? obj.baUnitSpatialUnitRegion : null;
        this.baUnitSeller = obj.baUnitSeller;
        this.baUnitBuyer = obj.baUnitBuyer;
        this.transactionInstance = obj.transactionInstance ? obj.transactionInstance : null;
    }
}
