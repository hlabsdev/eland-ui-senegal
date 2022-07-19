import { Bulletin } from './bulletin.model';
import { Notice } from './notice.model';
import { Rdai } from './rdai.model';
import { TransactionInstance } from './transactionInstance.model';

export class ComplementaryInfo {
    id: string;
    // General
    transactionInstance: TransactionInstance;

    // Bordereau
    numberInscription: number;
    oldSystemSlipNumber: number;
    inscriptionDate: Date;
    radiation: string;
    inscription: string;
    modification: string;
    signatoryAuthority: string;
    corps: string;
    rdaiId: string;
    rdai: Rdai;

    // Bulletin
    bulletin: Bulletin;

    // Notice
    notice: Notice;

    constructor(obj: any = {}) {
        this.id = obj.id;

        // General
        this.transactionInstance = obj.transactionInstance ? new TransactionInstance(obj.transactionInstance) : null;

        // Bordereau
        this.numberInscription = obj.numberInscription;
        this.inscriptionDate = obj.inscriptionDate ? new Date(obj.inscriptionDate) : new Date();
        this.radiation = obj.radiation;
        this.inscription = obj.inscription;
        this.modification = obj.modification;
        this.signatoryAuthority = obj.signatoryAuthority;
        this.corps = obj.corps;
        this.oldSystemSlipNumber = obj.oldSystemSlipNumber;

        this.rdaiId = obj.rdaiId;

        // Bulletin
        this.bulletin = obj.bulletin ? new Bulletin(obj.bulletin) : null;

        // Notice
        this.notice = obj.notice ? new Notice(obj.notice) : null;
    }
}
