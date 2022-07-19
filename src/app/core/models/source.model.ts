import { SourceTypeEnum } from '../../workstation/source/sourceType.model';
import { TransactionInstance } from './transactionInstance.model';
import { ExtArchive } from './extArchive.model';
import { ResponsibleParty } from './responsibleParty.model';
import { BAUnit } from '../../workstation/baUnit/baUnit.model';
import Utils from '../utils/utils';
export class Source {
    [x: string]: any;
    acceptanceDate: Date;
    availabilityStatus: any;
    extArchive: ExtArchive;
    id: string;
    lifeSpanStamp: Date;
    mainType: any;
    source: ResponsibleParty[];
    sourceType: SourceTypeEnum;
    submissionDate: Date;
    transactionInstance: TransactionInstance;
    recordationDate: Date;
    baUnitId: string;
    isElectronicSignatureNeeded: boolean;
    templateUrl: string;

    constructor(obj: any = {}) {
        this.acceptanceDate = Utils.setDate(obj.acceptanceDate);
        this.availabilityStatus = obj.availabilityStatus;
        this.extArchive = obj.extArchive ? new ExtArchive(obj.extArchive) : null;
        this.id = obj.id ? obj.id : null;
        this.lifeSpanStamp = Utils.setDate(obj.lifeSpanStamp);
        this.mainType = obj.mainType;
        this.sources = obj.sources ? obj.sources.map((rp) => new ResponsibleParty(rp)) : [];
        this.sourceType = obj.sourceType;
        this.submissionDate = Utils.setDate(obj.submissionDate);
        this.transactionInstance = obj.transactionInstance ? new TransactionInstance(obj.transactionInstance) : null;
        this.recordationDate = Utils.setDate(obj.recordationDate);
        this.baUnitId = obj.baUnitId;
        this.isElectronicSignatureNeeded = obj.isElectronicSignatureNeeded
            ? JSON.parse(obj.isElectronicSignatureNeeded)
            : false;
        this.templateUrl = obj.templateUrl;
    }

    addBAUnit(baUnit: BAUnit): void {
        if (baUnit && baUnit.uid) {
            this.baUnitId = baUnit.uid;
        }
    }
}
