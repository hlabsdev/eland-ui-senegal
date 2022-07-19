import { Applicant } from './applicant.model';
import { TransactionInstance } from './transactionInstance.model';
import { ResponsibleOffice } from '@app/core/models/responsibleOffice.model';
import Utils from '../utils/utils';

export class Application {
    id: string;
    applicationRequester: string;
    applicationRequesterType: number;
    applicationNumber: string;
    applicationDate: Date;
    applicationPurpose: string;
    transactionInstance: TransactionInstance;
    baUnitId: string;
    baUnitVersion: number;
    applicant: Applicant;
    status: string;
    statusDate: Date;
    urgentApplication: boolean;
    externalApplicant: boolean;
    responsibleOffice: ResponsibleOffice;
    imputationOffice: ResponsibleOffice;
    referenceNumber: string;

    constructor(obj: any = {}) {
        this.id = obj.id;
        this.applicationRequester = obj.applicationRequester;
        this.applicationRequesterType = obj.applicationRequesterType;
        this.applicationNumber = obj.applicationNumber;
        this.applicationDate = Utils.setDate(obj.applicationDate);
        this.applicationPurpose = obj.applicationPurpose;
        this.transactionInstance = obj.transactionInstance;
        this.baUnitId = obj.baUnitId;
        this.baUnitVersion = obj.baUnitVersion;
        this.applicant = obj.applicant ? new Applicant(obj.applicant) : new Applicant();
        this.status = obj.status;
        this.statusDate = Utils.setDate(obj.statusDate);
        this.urgentApplication = obj.urgentApplication ? obj.urgentApplication : false;
        this.externalApplicant = obj.externalApplicant ? obj.externalApplicant : false;
        this.responsibleOffice = obj.responsibleOffice ? new ResponsibleOffice(obj.responsibleOffice) : null;
        this.imputationOffice = obj.imputationOffice ? new ResponsibleOffice(obj.imputationOffice) : null;
        this.referenceNumber = obj.referenceNumber;
    }
}
